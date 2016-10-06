# coding: utf-8

from django.db import connection, transaction
from sqlalchemy.engine import create_engine

from .base_data_importer import BaseDataImporter
from utils import get_sqlalchemy_connection_string
from .sql_utils import *


class MultiIndexDataImporter(BaseDataImporter):
    """
    Extension of the data importer for when the index to compare the two
    dataframes is a multi index.
    """

    def __init__(self, niamoto_model, external_dataframe, index_cols,
                 niamoto_fields=None, update_fields=None):
        super(MultiIndexDataImporter, self).__init__(
            niamoto_model,
            external_dataframe,
            niamoto_fields=niamoto_fields,
            update_fields=update_fields
        )
        self.index_cols = index_cols

    @transaction.atomic
    def _process_delete(self):
        if len(self.delete_dataframe) == 0:
            return
        in_ids = self.delete_dataframe[self.index_cols]
        sql_s = self._generate_delete_statement(
            self.niamoto_model,
            self.index_cols,
            in_ids
        )
        cursor = connection.cursor()
        [cursor.execute(sql) for sql in sql_s]

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
            self.index_cols,
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
                'index_col': ','.join(self.index_cols)
            })
        engine = create_engine(get_sqlalchemy_connection_string())
        connection = engine.connect()
        df = pd.read_sql_query(
            sql,
            connection
        )
        connection.close()
        df.set_index(self.index_cols, drop=False, inplace=True)
        df.index.rename(
            self.index_cols,
            inplace=True
        )
        return df

    def _generate_delete_statement(self, model, id_field_names, in_ids,
                                   chunk_size=5000):
        sql_s = []
        chunks = len(in_ids) // chunk_size
        for i in range(chunks + 1):
            start_index = i * chunk_size
            end_index = start_index + chunk_size
            if i == chunks - 1:
                end_index = None
            ids_tuples = ','.join(in_ids[start_index:end_index].astype(str)
                                  .apply(','.join, axis=1)
                                  .apply('({})'.format, axis=1))
            sql = \
                """
                DELETE FROM {table} WHERE ({ids}) IN ({in_ids});
                """.format(**{
                    'table': model._meta.db_table,
                    'ids': ','.join(id_field_names),
                    'in_ids': ids_tuples,
                })
            sql_s.append(sql)
        return sql_s

    def _generate_update_statement(self, model, fields, values,
                                   id_field_names, temp_tablename='temp'):
        update_values = ','.join(["{f} = {t}.{f}".format(**{
            "f": f,
            't': temp_tablename
        }) for f in fields])
        where_statement = ' AND '.join(["{temp}.{i} = {table}.{i}".format(**{
            'temp': temp_tablename,
            'i': i,
            'table': model._meta.db_table
        }) for i in id_field_names])
        sql = \
            """
            CREATE TEMP TABLE {temp}(LIKE {table} INCLUDING ALL) ON COMMIT DROP;

            INSERT INTO {temp} ({fields})
            VALUES {values};

            UPDATE {table}
            SET {update_values}
            FROM {temp}
            WHERE {where_statement};
            """.format(**{
                'temp': temp_tablename,
                'table': model._meta.db_table,
                'fields': ','.join(fields),
                'values': values,
                'update_values': update_values,
                'where_statement': where_statement,
            })
        return sql
