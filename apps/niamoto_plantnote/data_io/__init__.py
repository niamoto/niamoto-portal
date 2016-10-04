# coding: utf-8

from sqlalchemy.engine import create_engine
import pandas as pd

from apps.niamoto_plantnote.models import PlantnoteOccurrence
from utils import get_sqlalchemy_connection_string


def get_plantnote_to_niamoto_ids():
    index_colname = 'occurrence_id'
    sql = \
        """
        SELECT occurrence_ptr_id AS occurrence_id, plantnote_id FROM {table}
        ORDER BY {index_col};
        """.format(**{
            'table': PlantnoteOccurrence._meta.db_table,
            'index_col': index_colname
        })
    engine = create_engine(get_sqlalchemy_connection_string())
    connection = engine.connect()
    df = pd.read_sql_query(
        sql,
        connection
    )
    df.set_index(index_colname, inplace=True, drop=False)
    df.index.rename(
        index_colname,
        inplace=True
    )
    return df
