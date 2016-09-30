# coding: utf-8

from django.db import transaction
import pandas as pd

from apps.niamoto_plantnote.data_io.data_importer import ExtendedModelDataImporter
from apps.niamoto_data.models import Occurrence
from ..models import PlantnoteOccurrence


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
    DF = pd.read_sql_query(sql, db_string, index_col='plantnote_id')
    index_col = DF.index.values
    DF['plantnote_id'] = index_col
    di = ExtendedModelDataImporter(Occurrence, PlantnoteOccurrence, DF)
    di.process_import()
