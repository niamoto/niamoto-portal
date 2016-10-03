# coding: utf-8

from django.db import transaction
from sqlalchemy.engine import create_engine
import pandas as pd

from apps.niamoto_data.models import PlotOccurrences
from apps.niamoto_plantnote.models import PlantnoteOccurrence
from apps.niamoto_plantnote.data_io.data_importer import MultiIndexDataImporter
from utils import get_sqlalchemy_connection_string


@transaction.atomic
def import_plot_occurrences_from_plantnote_db(database):
    db_string = 'sqlite:////{}'.format(database)
    sql = \
        """
        SELECT Inv."ID Individus" AS plantnote_id,
            Inv."ID Parcelle" AS plot_id,
            Inv."Identifiant" AS identifier
        FROM Inventaires AS Inv
        ORDER BY plantnote_id, plot_id;
        """
    DF = pd.read_sql_query(sql, db_string)
    plantnote_to_niamoto_ids = _get_plantnote_to_niamoto_ids()
    DF = pd.merge(DF, plantnote_to_niamoto_ids, on="plantnote_id")\
        .set_index(['occurrence_id', 'plot_id'], drop=False)\
        .drop('plantnote_id', 1)
    di = MultiIndexDataImporter(
        PlotOccurrences,
        DF,
        ['occurrence_id', 'plot_id'],
        update_fields=['identifier'],
        niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
    )
    return di
    # di.process_import()


def _get_plantnote_to_niamoto_ids():
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
