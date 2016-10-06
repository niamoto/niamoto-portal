# coding: utf-8

from django.db import transaction
import pandas as pd

from apps.niamoto_data.models import PlotOccurrences
from apps.data_importer import MultiIndexDataImporter
from apps.niamoto_plantnote.data_io import get_plantnote_to_niamoto_ids


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
    plantnote_to_niamoto_ids = get_plantnote_to_niamoto_ids()
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
    di.process_import()
