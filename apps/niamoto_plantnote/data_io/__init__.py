# coding: utf-8

from django.db import connection, transaction
import pandas as pd
import numpy as np

from utils import get_sqlalchemy_connection_string


class DataImporter:
    """
    Experimental data importer pattern between niamoto (the main datastore)
    and a external data source (eg: Pl@ntnote).
    """

    def __init__(self, niamoto_model, niamoto_join_model,
                 external_connection_string, external_sql,
                 fields_map, extra_fields_map, external_id,
                 niamoto_fields=["*"], external_apply_funcs={},
                 quote_fields=None, quote_extra_fields=None):
        # Descriptive attributes
        self.niamoto_model = niamoto_model
        self.niamoto_join_model = niamoto_join_model
        self.external_connection_string = external_connection_string
        self.external_sql = external_sql
        self.fields_map = fields_map  # <external_field>: <niamoto_field>
        self.extra_fields_map = extra_fields_map  # idem
        self.external_id = external_id
        self.quote_fields = quote_fields
        self.quote_extra_fields = quote_extra_fields
        self.niamoto_fields = niamoto_fields
        self.external_apply_funcs = external_apply_funcs
        # Initial dataframes
        self._niamoto_dataframe = None
        self._external_dataframe = None
        self._reshaped_external_dataframe = None
        # Insert, Update and Delete dataframes
        self._insert_dataframe = None
        self._update_dataframe_current = None
        self._update_dataframe_new = None
        self._delete_dataframe = None

    @property
    def niamoto_dataframe(self):
        if self._niamoto_dataframe is None:
            self._init_niamoto_dataframe()
        return self._niamoto_dataframe

    @property
    def external_dataframe(self):
        if self._external_dataframe is None:
            self._init_external_dataframe()
        return self._external_dataframe

    @property
    def reshaped_external_dataframe(self):
        if self._reshaped_external_dataframe is None:
            self._init_reshaped_external_dataframe()
        return self._reshaped_external_dataframe

    @property
    def insert_dataframe(self):
        if self._insert_dataframe is None:
            self._init_insert_dataframe()
        return self._insert_dataframe

    @property
    def update_dataframe_current(self):
        if self._update_dataframe_current is None:
            self._init_update_dataframes()
        return self._update_dataframe_current

    @property
    def update_dataframe_new(self):
        if self._update_dataframe_new is None:
            self._init_update_dataframes()
        return self._update_dataframe_new

    @property
    def delete_dataframe(self):
        if self._delete_dataframe is None:
            self._init_delete_dataframe()
        return self._delete_dataframe

    @transaction.atomic
    def _process_insert(self):
        if len(self.insert_dataframe) == 0:
            return self.insert_dataframe
        fields = list(self.fields_map.values())
        apply_funcs = {}
        for f in fields:
            django_field = self.niamoto_model._meta.get_field(f)
            int_types = ['ForeignKey', 'AutoField', 'IntegerField']
            if django_field.get_internal_type() in int_types:
                apply_funcs[f] = float_to_int
        values = generate_sql_values(
            self.insert_dataframe,
            fields,
            apply=apply_funcs,
            quote_fields=self.quote_fields
        )
        main_sql = \
            """
            WITH t AS (
                INSERT INTO {niamoto_model} ({fields})
                VALUES {values}
                RETURNING id
            )
            SELECT id FROM t ORDER BY id;
            """.format(**{
                'niamoto_model': self.niamoto_model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
            })
        cursor = connection.cursor()
        cursor.execute(main_sql)
        ids = pd.DataFrame({'id': np.array(cursor.fetchall())[:, 0]})
        ids.index = self.insert_dataframe.index
        assert len(ids) == len(self.insert_dataframe)
        extra_fields = list(self.extra_fields_map.values())
        join_fields = extra_fields + [
            self._get_ptr_field_name(),
            self.external_id
        ]
        join_apply_funcs = {}
        for f in join_fields:
            django_field = self.niamoto_join_model._meta.get_field(f)
            int_types = ['ForeignKey', 'AutoField', 'IntegerField']
            if django_field.get_internal_type() in int_types:
                join_apply_funcs[f] = float_to_int
        self.insert_dataframe[self._get_ptr_field_name()] = ids['id']
        join_values = generate_sql_values(
            self.insert_dataframe,
            join_fields,
            apply=join_apply_funcs,
            quote_fields=self.quote_extra_fields
        )
        join_sql = \
            """
            INSERT INTO {join_model} ({join_fields})
            VALUES {join_values};
            """.format(**{
                'join_model': self.niamoto_join_model._meta.db_table,
                'join_fields': ','.join(join_fields),
                'join_values': join_values
            })
        cursor.execute(join_sql)
        return self.insert_dataframe

    @transaction.atomic
    def _process_delete(self):
        if len(self.delete_dataframe) == 0:
            return self.delete_dataframe
        in_array = self.delete_dataframe[self.external_id]
        in_array = in_array.apply(float_to_int, axis=1)
        in_array_sql = '({})'.format(','.join(in_array))
        sql = \
            """
            WITH t AS (
                DELETE FROM {join_table} WHERE {external_id} IN {in_array_sql}
                RETURNING {ptr_field}
            )
            DELETE FROM {main_table} WHERE id IN (SELECT {ptr_field} FROM t);
            """.format(**{
                'join_table': self.niamoto_join_model._meta.db_table,
                'external_id': self.external_id,
                'in_array_sql': in_array_sql,
                'ptr_field': self._get_ptr_field_name(),
                'main_table': self.niamoto_model._meta.db_table,
            })
        cursor = connection.cursor()
        cursor.execute(sql)
        return self.delete_dataframe

    @transaction.atomic
    def _process_update(self):
        l1 = len(self.update_dataframe_current)
        l2 = len(self.update_dataframe_new)
        assert l1 == l2
        if l1 == 0:
            return self.update_dataframe_new
        # Main table values
        fields = ['id'] + list(self.fields_map.values())
        apply_funcs = {}
        for f in fields:
            django_field = self.niamoto_model._meta.get_field(f)
            int_types = ['ForeignKey', 'AutoField', 'IntegerField']
            if django_field.get_internal_type() in int_types:
                apply_funcs[f] = float_to_int
        values = generate_sql_values(
            self.update_dataframe_new,
            fields,
            apply=apply_funcs,
            quote_fields=self.quote_fields
        )
        sets = ["{field} = temp_update.{field}".format(**{
            'field': field,
        }) for field in fields]
        update_values = ','.join(sets)
        # Join table values
        extra_fields = list(self.extra_fields_map.values())
        ptr_field = self._get_ptr_field_name()
        join_fields = extra_fields + [
            ptr_field,
            self.external_id
        ]
        join_apply_funcs = {}
        for f in join_fields:
            django_field = self.niamoto_join_model._meta.get_field(f)
            int_types = ['ForeignKey', 'AutoField', 'IntegerField']
            if django_field.get_internal_type() in int_types:
                join_apply_funcs[f] = float_to_int
        self.update_dataframe_new[ptr_field] = self.update_dataframe_new['id']
        join_values = generate_sql_values(
            self.update_dataframe_new,
            join_fields,
            apply=join_apply_funcs,
            quote_fields=self.quote_extra_fields
        )
        join_sets = ["{field} = temp_update_join.{field}".format(**{
            'field': field,
        }) for field in join_fields]
        update_join_values = ','.join(join_sets)
        sql = \
            """
            CREATE TEMP TABLE temp_update(LIKE {table} INCLUDING ALL) ON COMMIT DROP;

            INSERT INTO temp_update ({fields})
            VALUES {values};

            UPDATE {table}
            SET {update_values}
            FROM temp_update
            WHERE {table}.id = temp_update.id;

            CREATE TEMP TABLE temp_update_join(LIKE {join_table} INCLUDING ALL) ON COMMIT DROP;

            INSERT INTO temp_update_join({join_fields})
            VALUES {join_values};

            UPDATE {join_table}
            SET {update_join_values}
            FROM temp_update_join
            WHERE {join_table}.{ptr_field} = temp_update_join.{ptr_field};
            """.format(**{
                'table': self.niamoto_model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
                'update_values': update_values,
                'join_table': self.niamoto_join_model._meta.db_table,
                'join_fields': ','.join(join_fields),
                'join_values': join_values,
                'update_join_values': update_join_values,
                'ptr_field': ptr_field,
            })
        cursor = connection.cursor()
        cursor.execute(sql)
        return self.update_dataframe_new

    def _get_ptr_field_name(self):
        ptr_field = self.niamoto_join_model._meta.parents[self.niamoto_model]
        return ptr_field.get_attname()

    def _init_niamoto_dataframe(self):
        sql = \
            """
            SELECT {fields} FROM {join_table}
            INNER JOIN {table}
              ON {table}.id = {join_table}.{ptr_field}
            ORDER BY {index_col};
            """.format(**{
                'fields': ','.join(['id'] + self.niamoto_fields),
                'join_table': self.niamoto_join_model._meta.db_table,
                'table': self.niamoto_model._meta.db_table,
                'ptr_field': self._get_ptr_field_name(),
                'index_col': self.external_id
            })
        self._niamoto_dataframe = pd.read_sql_query(
            sql,
            get_sqlalchemy_connection_string(),
            index_col=self.external_id
        )

    def _init_external_dataframe(self):
        self._external_dataframe = pd.read_sql_query(
            self.external_sql,
            self.external_connection_string,
            index_col=self.external_id
        )

    def _init_reshaped_external_dataframe(self):
        # Only retain necessary columns
        field_keys = list(self.fields_map.keys())
        extra_field_keys = list(self.extra_fields_map.keys())
        reshaped = self.external_dataframe[field_keys + extra_field_keys]
        # Apply map functions
        for field, func in self.external_apply_funcs.items():
            reshaped[field] = reshaped[field].apply(func)
        # Rename columns
        cols = list()
        for c in reshaped.columns:
            if c in self.fields_map:
                cols.append(self.fields_map[c])
            else:
                cols.append(self.extra_fields_map[c])
        reshaped.columns = cols
        self._reshaped_external_dataframe = reshaped

    def _init_insert_dataframe(self):
        external_index = self.reshaped_external_dataframe.index
        niamoto_index = self.niamoto_dataframe.index
        insert_index = external_index.difference(niamoto_index)
        insert = self.reshaped_external_dataframe.loc[insert_index]
        self._insert_dataframe = insert
        # Duplicate index as a column
        index_col = self._insert_dataframe.index.values
        self._insert_dataframe[self.external_id] = index_col

    def _init_update_dataframes(self):
        niamoto_index = self.niamoto_dataframe.index
        external_index = self.reshaped_external_dataframe.index
        intersect_index = niamoto_index.intersection(external_index)
        fields = list(self.fields_map.values())
        extra_fields = list(self.extra_fields_map.values())
        all_fields = fields + extra_fields
        A = self.niamoto_dataframe[all_fields].loc[intersect_index]
        B = self.reshaped_external_dataframe.loc[intersect_index]
        A_nona = A.fillna(-1)
        B_nona = B.fillna(-1)
        changed = (A_nona != B_nona).any(1)
        ids = self.niamoto_dataframe['id'].loc[intersect_index][changed]
        # Duplicate index as a column
        index_col_a = A.index.values
        A[self.external_id] = index_col_a
        A['id'] = ids
        index_col_b = B.index.values
        B[self.external_id] = index_col_b
        B['id'] = ids
        # Assign new values
        self._update_dataframe_current = A[changed]
        self._update_dataframe_new = B[changed]

    def _init_delete_dataframe(self):
        external_index = self.reshaped_external_dataframe.index
        niamoto_index = self.niamoto_dataframe.index
        delete_index = niamoto_index.difference(external_index)
        delete = self.niamoto_dataframe.loc[delete_index]
        self._delete_dataframe = delete
        # Duplicate index as a column
        index_col = self._delete_dataframe.index.values
        self._delete_dataframe[self.external_id] = index_col


def generate_sql_values(dataframe, fields, apply={}, quote_fields=True):
    cols = [dataframe[i].apply(nan_to_null).astype(str) for i in fields]
    df = pd.concat(cols, axis=1)
    for f, func in apply.items():
        df[f] = df[f].apply(func)
    if quote_fields is None:
        quote_fields = {f: True for f in fields}
    elif isinstance(quote_fields, bool) and quote_fields:
        quote_fields = {f: quote_fields for f in fields}
    for f, b in quote_fields.items():
        if b:
            df[f] = df[f].apply(quote, axis=1)
    return ','.join(df.apply(','.join, axis=1).apply('({})'.format, axis=1))


def nan_to_null(value, **kwargs):
    if pd.isnull(value):
        return 'NULL'
    return value


def quote(value, **kwargs):
    if value == 'NULL':
        return value
    return "'{}'".format(value)


def float_to_int(value, **kwargs):
    if pd.isnull(value):
        return nan_to_null(value)
    if value == 'NULL':
        return value
    return str(int(float(value)))
