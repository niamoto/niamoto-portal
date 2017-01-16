# coding: utf-8

from django.db import transaction, connection
import pandas as pd

from apps.data_importer import ExtendedModelDataImporter
from apps.niamoto_data.models import Occurrence, OccurrenceObservations, \
    PlotOccurrences
from apps.niamoto_plantnote.models import PlantnoteOccurrence


@transaction.atomic
def import_occurrences_from_plantnote_db(database):
    """
    Import an occurrence list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    db_string = 'sqlite:////{}'.format(database)
    sql = \
        """
        SELECT Indiv."ID Individus" AS plantnote_id,
               Inv."Date Inventaire" AS date,
               datetime('now') AS created_at,
               datetime('now') AS updated_at,
               Det."ID Taxons" AS taxon_id,
               'POINT(' || Loc.LongDD || ' ' || Loc.LatDD || ')' AS location,
                Col."Collecteur" AS collector
        FROM Individus AS Indiv
        INNER JOIN Inventaires AS Inv ON Indiv."ID Inventaires" = Inv."ID Inventaires"
        LEFT JOIN Localités AS Loc ON Inv."ID Parcelle" = Loc."ID Localités"
        LEFT JOIN Déterminations AS Det ON Indiv."ID Déterminations" = Det."ID Déterminations"
        LEFT JOIN Observations AS Obs ON Indiv."ID Observations" = Obs."ID Observations"
        LEFT JOIN Collecteurs AS Col ON Obs."Observateur" = Col."ID Collecteurs"
        ORDER BY plantnote_id;
        """
    DF = pd.read_sql_query(sql, db_string)
    DF.set_index('plantnote_id', inplace=True, drop=False)
    di = ExtendedModelDataImporter(
        Occurrence,
        PlantnoteOccurrence,
        DF,
        update_fields=[
            'date', 'taxon_id', 'location',
            'plantnote_id', 'collector'
        ],
    )
    # Delete occurrence observations and plot occurrences
    # referring to occurrences in delete selection
    ids_1 = di.niamoto_extended_dataframe['plantnote_id']
    ids_2 = di.delete_dataframe['plantnote_id']
    base_id = di.get_extended_index_col()
    ids = di.niamoto_extended_dataframe[ids_1.isin(ids_2)][base_id].apply(str)
    occ_obs_id_col = OccurrenceObservations.occurrence.field.get_attname()
    plot_occ_id_col = PlotOccurrences.occurrence.field.get_attname()
    if len(ids) > 0:
        sql = \
            """
            DELETE FROM {occ_obs_table}
            WHERE {occ_obs_id_col} IN ({ids});
            DELETE FROM {plot_occ_table}
            WHERE {plot_occ_id_col} IN ({ids});
            """.format(**{
                'occ_obs_table': OccurrenceObservations._meta.db_table,
                'plot_occ_table': PlotOccurrences._meta.db_table,
                'occ_obs_id_col': occ_obs_id_col,
                'plot_occ_id_col': plot_occ_id_col,
                'ids': ','.join(ids),
            })
        cur = connection.cursor()
        cur.execute(sql)
        cur.close()
    di.process_import()
