# coding: utf-8

import pandas as pd

from utils import get_sqlalchemy_connection_string


class DataImporter:
    """
    Experimental data importer pattern between niamoto (the main datastore)
    and a external data source (eg: Pl@ntnote).
    """

    def __init__(self, niamoto_model, niamoto_join_model,
                 external_connection_string, external_sql,
                 fields_map, extra_fields_map, external_id,
                 niamoto_fields=["*"], external_apply_funcs={}):
        # Descriptive attributes
        self.niamoto_model = niamoto_model
        self.niamoto_join_model = niamoto_join_model
        self.external_connection_string = external_connection_string
        self.external_sql = external_sql
        self.fields_map = fields_map  # <external_field>: <niamoto_field>
        self.extra_fields_map = extra_fields_map  # idem
        self.external_id = external_id
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

    def _process_insert(self):
        fields = list(self.fields_map.values())
        values = generate_sql_values(self.insert_dataframe, fields)
        main_sql = \
            """
            WITH t AS (
                INSERT INTO {niamoto_model} ({fields})
                VALUES {values}
                RETURNING id
            )
            SELECT id FROM t;
            """.format(**{
                'niamoto_model': self.niamoto_model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
            })
        return main_sql

    def _process_delete(self):
        pass

    def _process_update(self):
        pass

    def _get_ptr_field(self):
        return self.niamoto_join_model._meta.parents[self.niamoto_model]

    def _init_delete_dataframe(self):
        external_index = self.reshaped_external_dataframe.index
        niamoto_index = self.niamoto_dataframe.index
        delete_index = niamoto_index.difference(external_index)
        delete = self.niamoto_dataframe.loc[delete_index]
        self._delete_dataframe = delete

    def _init_niamoto_dataframe(self):
        sql = \
            """
            SELECT {fields} FROM {join_table}
            INNER JOIN {table}
              ON {table}.id = {join_table}.{ptr_field}
            ORDER BY {index_col};
            """.format(**{
                'fields': ','.join(self.niamoto_fields),
                'join_table': self.niamoto_join_model._meta.db_table,
                'table': self.niamoto_model._meta.db_table,
                'ptr_field': self._get_ptr_field().get_attname(),
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
        print(B[changed][:5])
        print()
        print(A[changed][:5])
        self._update_dataframe_current = A[changed]
        self._update_dataframe_new = B[changed]


def generate_sql_values(dataframe, fields):
    cols = [dataframe[i].astype(str) for i in fields]
    df = pd.concat(cols, axis=1)
    return ','.join(df.apply(','.join, axis=1).apply('({})'.format, axis=1))
