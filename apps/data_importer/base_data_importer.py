# coding: utf-8

from django.db import connection, transaction
from sqlalchemy.engine import create_engine
from pandas.types.dtypes import DatetimeTZDtype

from utils import get_sqlalchemy_connection_string
from .sql_utils import *


class BaseDataImporter:
    """
    Experimental data importer pattern between niamoto (the main datastore)
    and a external data source (eg: Pl@ntnote).
    """

    def __init__(self, niamoto_model, external_dataframe,
                 niamoto_fields=None, update_fields=None):
        # Descriptive attributes
        self.niamoto_model = niamoto_model
        self.niamoto_fields = niamoto_fields
        self.update_fields = update_fields
        if self.niamoto_fields is None:
            self.niamoto_fields = get_model_fieldnames(self.niamoto_model)
        # Initial dataframes
        self._niamoto_dataframe = None
        self._external_dataframe = external_dataframe
        # Insert, Update and Delete dataframes
        self._insert_dataframe = None
        self._update_dataframe_current = None
        self._update_dataframe_new = None
        self._delete_dataframe = None

    def _invalidate_cache(self):
        self._niamoto_dataframe = None
        self._insert_dataframe = None
        self._update_dataframe_current = None
        self._update_dataframe_new = None
        self._delete_dataframe = None

    @property
    def niamoto_dataframe(self):
        if self._niamoto_dataframe is None:
            self._niamoto_dataframe = self._init_niamoto_dataframe()
        return self._niamoto_dataframe

    @property
    def external_dataframe(self):
        return self._external_dataframe

    @property
    def insert_dataframe(self):
        if self._insert_dataframe is None:
            self._insert_dataframe = get_insert_dataframe(
                self.niamoto_dataframe,
                self.external_dataframe
            )
        return self._insert_dataframe

    @property
    def update_dataframe_current(self):
        if self._update_dataframe_current is None:
            self._update_dataframe_current = get_update_dataframe_current(
                self.niamoto_dataframe,
                self.external_dataframe,
                self.update_fields
            )
        return self._update_dataframe_current

    @property
    def update_dataframe_new(self):
        if self._update_dataframe_new is None:
            self._update_dataframe_new = get_update_dataframe_new(
                self.niamoto_dataframe,
                self.external_dataframe,
                self.update_fields
            )
        return self._update_dataframe_new

    @property
    def delete_dataframe(self):
        if self._delete_dataframe is None:
            self._delete_dataframe = get_delete_dataframe(
                self.niamoto_dataframe,
                self.external_dataframe
            )
        return self._delete_dataframe

    @transaction.atomic
    def process_import(self):
        self._process_insert()
        self._process_update()
        self._process_delete()
        self._invalidate_cache()

    @transaction.atomic
    def _process_insert(self):
        if len(self.insert_dataframe) == 0:
            return
        sql = self._generate_insert_statement(
            self.niamoto_model,
            self.niamoto_fields,
            self.insert_dataframe
        )
        cursor = connection.cursor()
        cursor.execute(sql)

    @transaction.atomic
    def _process_delete(self):
        if len(self.delete_dataframe) == 0:
            return
        in_ids = self.delete_dataframe[self.get_index_col()].astype(str)
        sql = self._generate_delete_statement(
            self.niamoto_model,
            self.get_index_col(),
            in_ids
        )
        cursor = connection.cursor()
        cursor.execute(sql)

    @transaction.atomic
    def _process_update(self):
        l1 = len(self.update_dataframe_current)
        l2 = len(self.update_dataframe_new)
        assert l1 == l2
        if l1 == 0:
            return
        values = self._generate_sql_values(
            self.niamoto_model,
            self.niamoto_fields,
            self.update_dataframe_new,
        )
        sql = self._generate_update_statement(
            self.niamoto_model,
            self.niamoto_fields,
            values,
            self.get_index_col()
        )
        cursor = connection.cursor()
        cursor.execute(sql)

    def _init_niamoto_dataframe(self):
        select_fields = get_select_fields_statements(
            self.niamoto_model,
            self.niamoto_fields,
            geom_as_text=True
        )
        sql = \
            """
            SELECT {fields} FROM {table}
            ORDER BY {index_col};
            """.format(**{
                'fields': ','.join(select_fields),
                'table': self.niamoto_model._meta.db_table,
                'index_col': self.get_index_col()
            })
        engine = create_engine(get_sqlalchemy_connection_string())
        conn = engine.connect()
        df = pd.read_sql_query(
            sql,
            conn,
        )
        df.set_index(self.get_index_col(), inplace=True, drop=False)
        df.index.rename(
            self.get_index_col(),
            inplace=True
        )
        conn.close()
        for col in df.columns:
            if isinstance(df[col].dtype, DatetimeTZDtype):
                df[col] = df[col].astype(str)
        return df

    def get_index_col(self):
        return self.niamoto_model._meta.pk.get_attname()

    def _generate_sql_values(self, model, fields, dataframe):
        apply_funcs = {}
        quote_fields = {}
        for f in fields:
            quote_fields[f] = True
            django_field = model._meta.get_field(f)
            # Force convert to int when necessary
            int_types = ['ForeignKey', 'AutoField', 'IntegerField',
                         'TreeForeignKey']
            if django_field.get_internal_type() in int_types:
                apply_funcs[f] = float_to_int
            # Geom from text for geometry columns
            if hasattr(django_field, 'srid'):
                apply_funcs[f] = geom_from_text(django_field.srid)
                quote_fields[f] = False
        return generate_sql_values(
            dataframe,
            fields,
            apply=apply_funcs,
            quote_fields=quote_fields
        )

    def _generate_insert_statement(self, model, fields, dataframe):
        values = self._generate_sql_values(model, fields, dataframe)
        sql = \
            """
            INSERT INTO {model_table} ({fields})
            VALUES {values};
            """.format(**{
                'model_table': model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
            })
        return sql

    def _generate_delete_statement(self, model, id_field_name, in_ids):
        sql = \
            """
            DELETE FROM {table} WHERE {id} IN ({in_ids});
            """.format(**{
                'table': model._meta.db_table,
                'id': id_field_name,
                'in_ids': ','.join(in_ids),
            })
        return sql

    def _generate_update_statement(self, model, fields, values, id_field_name,
                                   temp_tablename='temp'):
        update_values = ','.join(["{f} = {t}.{f}".format(**{
            "f": f,
            't': temp_tablename
        }) for f in fields])
        sql = \
            """
            DROP TABLE IF EXISTS {temp};
            CREATE TEMP TABLE {temp}(LIKE {table} INCLUDING ALL) ON COMMIT DROP;

            INSERT INTO {temp} ({fields})
            VALUES {values};

            UPDATE {table}
            SET {update_values}
            FROM {temp}
            WHERE {temp}.{id} = {table}.{id};
            """.format(**{
                'temp': temp_tablename,
                'table': model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
                'update_values': update_values,
                'id': id_field_name,
            })
        return sql


def get_insert_dataframe(current_dataframe, new_dataframe):
    """
    Compute an insert dataframe from two exactly structured dataframes (same
    columns, same datatypes, same index).
    :param current_dataframe: The dataframe reflecting the current state of the
                              database.
    :param new_dataframe: The dataframe to import.
    :return: A dataframe containing the records to insert, ie those who are
            in new_dataframe but not in current_dataframe.
    """
    import_index = new_dataframe.index
    current_index = current_dataframe.index
    insert_index = import_index.difference(current_index)
    insert = new_dataframe.loc[insert_index]
    return insert


def get_update_boolean_index(current_dataframe, new_dataframe, fields=None):
    """
    Compute a boolean upaate index from two exactly structured dataframes (same
    columns, same datatypes, same index).
    :param current_dataframe: The dataframe reflecting the current state of the
                              database.
    :param new_dataframe: The dataframe to import.
    :param fields: The fields to rely on for the values comparison. If None
                  all the fields are used.
    :return: An index, subset of current and new indexes, containing only the
            indices of records that need to be updated.
    """
    current_index = current_dataframe.index
    import_index = new_dataframe.index
    intersect_index = current_index.intersection(import_index)
    cur_intersect = current_dataframe.loc[intersect_index]
    imp_intersect = new_dataframe.loc[intersect_index]
    cur_intersect_no_na = cur_intersect.fillna(-1)
    imp_intersect_no_na = imp_intersect.fillna(-1)
    if fields is None:
        fields = cur_intersect_no_na.columns
    changed = (cur_intersect_no_na[fields] != imp_intersect_no_na[fields]).any(1)
    return intersect_index, changed


def get_update_dataframe_current(current_dataframe, new_dataframe, fields=None):
    index, changed = get_update_boolean_index(
        current_dataframe,
        new_dataframe,
        fields
    )
    return current_dataframe.loc[index][changed]


def get_update_dataframe_new(current_dataframe, new_dataframe, fields=None):
    index, changed = get_update_boolean_index(
        current_dataframe,
        new_dataframe,
        fields
    )
    return new_dataframe.loc[index][changed]


def get_delete_dataframe(current_dataframe, new_dataframe):
    """
    Compute a delete dataframe from two exactly structured dataframes (same
    columns, same datatypes, same index).
    :param current_dataframe: The dataframe reflecting the current state of the
                              database.
    :param new_dataframe: The dataframe to import.
    :return: A dataframe containing the records to delete, ie those who are
            in current_dataframe but not in new_dataframe.
    """
    current_index = current_dataframe.index
    import_index = new_dataframe.index
    delete_index = current_index.difference(import_index)
    delete = current_dataframe.loc[delete_index]
    return delete
