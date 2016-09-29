# coding: utf-8

from sqlalchemy.engine import create_engine
import pandas as pd
import numpy as np
from django.db import connection, transaction

from utils import get_sqlalchemy_connection_string
from .base_data_importer import BaseDataImporter
from .sql_utils import *


class ExtendedModelDataImporter(BaseDataImporter):
    """
    Extension of the base data importer for cases where the data to import
    if from an extended model, where a mapping between the niamoto's id and
    the external id is kept.
    """

    def __init__(self, niamoto_model, niamoto_extended_model,
                 external_dataframe, niamoto_fields=None):
        super(ExtendedModelDataImporter, self).__init__(
            niamoto_model,
            external_dataframe,
            niamoto_fields
        )
        self.niamoto_extended_model = niamoto_extended_model
        self._niamoto_extended_dataframe = None
        self._niamoto_base_dataframe = None
        self.niamoto_extended_fields = [
            self.get_extended_index_col(),
            self.get_external_index_col()
        ]
        for col in self.external_dataframe.columns:
            if col in self.niamoto_extended_fields:
                continue
            if col not in self.niamoto_fields:
                self.niamoto_extended_fields.append(col)

    def _invalidate_cache(self):
        super(ExtendedModelDataImporter, self)._invalidate_cache()
        self._niamoto_extended_dataframe = None
        self._niamoto_base_dataframe = None

    @property
    def niamoto_extended_extra_fields(self):
        fields = list(self.niamoto_extended_fields)
        fields.remove(self.get_external_index_col())
        fields.remove(self.get_extended_index_col())
        return fields

    @property
    def niamoto_base_dataframe(self):
        if self._niamoto_base_dataframe is None:
            df = self._init_niamoto_base_dataframe()
            self._niamoto_base_dataframe = df
        return self._niamoto_base_dataframe

    @property
    def niamoto_extended_dataframe(self):
        if self._niamoto_extended_dataframe is None:
            df = self._init_niamoto_extended_dataframe()
            self._niamoto_extended_dataframe = df
        return self._niamoto_extended_dataframe

    @property
    def insert_base_dataframe(self):
        df = self.insert_dataframe.drop(self.niamoto_extended_extra_fields, 1)
        return df.drop(self.get_external_index_col(), 1)

    @property
    def update_base_dataframe_new(self):
        df = pd.merge(
            self.update_dataframe_new,
            self.niamoto_extended_dataframe,
            on='plantnote_id',
        )
        df.drop(self.get_external_index_col(), 1, inplace=True)
        df.rename(
            columns={self.get_extended_index_col(): self.get_index_col()},
            inplace=True
        )
        return df

    @property
    def update_extended_dataframe_new(self):
        df = pd.merge(
            self.update_dataframe_new,
            self.niamoto_extended_dataframe.drop(self.niamoto_extended_extra_fields, 1),
            on='plantnote_id',
        )
        return df[self.niamoto_extended_fields]

    @transaction.atomic
    def _process_insert(self):
        if len(self.insert_dataframe) == 0:
            return
        # Base table sql
        fields = [i for i in self.niamoto_fields if i != self.get_index_col()]
        insert_sql = self._generate_insert_statement(
            self.niamoto_model,
            fields,
            self.insert_base_dataframe
        ).replace(';', '')
        sql = \
            """
            WITH t AS ({insert_sql} RETURNING {id})
            SELECT {id} FROM t ORDER BY {id};
            """.format(**{
                'insert_sql': insert_sql,
                'id': self.get_index_col()
            })
        cursor = connection.cursor()
        cursor.execute(sql)
        ids = pd.DataFrame({
            self.get_extended_index_col(): np.array(cursor.fetchall())[:, 0]
        })
        ids.index = self.insert_dataframe.index
        ext_index_col = self.get_external_index_col()
        ids[ext_index_col] = self.insert_dataframe[ext_index_col]
        ids = pd.merge(
            ids,
            self.external_dataframe[self.niamoto_extended_extra_fields],
            left_index=True,
            right_index=True
        )
        assert len(ids) == len(self.insert_dataframe)
        # Extended table sql
        extended_sql = self._generate_insert_statement(
            self.niamoto_extended_model,
            self.niamoto_extended_fields,
            ids
        )
        cursor.execute(extended_sql)

    @transaction.atomic
    def _process_update(self):
        l1 = len(self.update_dataframe_current)
        l2 = len(self.update_dataframe_new)
        assert l1 == l2
        if l1 == 0:
            return
        base_values = self._generate_sql_values(
            self.niamoto_model,
            self.niamoto_fields,
            self.update_base_dataframe_new
        )
        base_sql = self._generate_update_statement(
            self.niamoto_model,
            self.niamoto_fields,
            base_values,
            self.get_index_col()
        )
        extended_values = self._generate_sql_values(
            self.niamoto_extended_model,
            self.niamoto_extended_fields,
            self.update_extended_dataframe_new
        )
        extended_sql = self._generate_update_statement(
            self.niamoto_extended_model,
            self.niamoto_extended_fields,
            extended_values,
            self.get_external_index_col(),
            temp_tablename='temp_2'
        )
        sql = base_sql + extended_sql
        cursor = connection.cursor()
        cursor.execute(sql)

    @transaction.atomic
    def _process_delete(self):
        if len(self.delete_dataframe) == 0:
            return
        in_ids_extended = self.delete_dataframe[self.get_external_index_col()]
        delete_sql = self._generate_delete_statement(
            self.niamoto_extended_model,
            self.get_external_index_col(),
            in_ids_extended.astype(str)
        ).replace(';', '')
        sql = \
            """
            WITH t AS ({delete_sql} RETURNING {id})
            DELETE FROM {base_table} WHERE {base_id} IN (SELECT {id} FROM t);
            """.format(**{
                'delete_sql': delete_sql,
                'id': self.get_extended_index_col(),
                'base_table': self.niamoto_model._meta.db_table,
                'base_id': self.get_index_col()
            })
        cursor = connection.cursor()
        cursor.execute(sql)

    def get_extended_index_col(self):
        id_col = self.niamoto_extended_model._meta.parents[self.niamoto_model]
        return id_col.get_attname()

    def get_external_index_col(self):
        return self.external_dataframe.index.name

    def _init_niamoto_base_dataframe(self):
        return super(ExtendedModelDataImporter, self)._init_niamoto_dataframe()

    def _init_niamoto_extended_dataframe(self):
        select_fields = get_select_fields_statements(
            self.niamoto_extended_model,
            self.niamoto_extended_fields,
            geom_as_text=True
        )
        index_colname = self.get_extended_index_col()
        sql = \
            """
            SELECT {fields} FROM {table}
            ORDER BY {index_col};
            """.format(**{
                'fields': ','.join(select_fields),
                'table': self.niamoto_extended_model._meta.db_table,
                'index_col': index_colname
            })
        engine = create_engine(get_sqlalchemy_connection_string())
        connection = engine.connect()
        df = pd.read_sql_query(
            sql,
            connection,
            index_col=index_colname
        )
        index_col = df.index.values
        df[index_colname] = index_col
        df.index.rename(
            index_colname,
            inplace=True
        )
        connection.close()
        return df

    def _init_niamoto_dataframe(self):
        df = pd.merge(
            self.niamoto_base_dataframe,
            self.niamoto_extended_dataframe,
            left_index=True,
            right_index=True
        )
        external_index_colname = self.get_external_index_col()
        df.set_index(external_index_colname, inplace=True)
        fields = self.niamoto_fields + self.niamoto_extended_fields
        fields.remove(self.get_index_col())
        fields.remove(self.get_extended_index_col())
        fields.remove(self.get_external_index_col())
        df = df[fields]
        index_col = df.index.values
        df[external_index_colname] = index_col
        df.index.rename(
            external_index_colname,
            inplace=True
        )
        return df
