# coding: utf-8

from django.db import transaction
import pandas as pd

from apps.niamoto_data.models import Plot
from apps.niamoto_plantnote.data_io.data_importer import BaseDataImporter


@transaction.atomic
def import_plots_from_plantnote_db(database):
    """
    Import a plot list from a Pl@ntnote database.
    :param database: The path to the plantnote database.
    """
    db_string = 'sqlite:////{}'.format(database)
    sql = \
        """
        SELECT "ID Localités" AS id,
            "Nom Entier" AS name,
            "Largeur" AS width,
            "Longueur" AS height,
            'POINT(' || "LongDD" || ' ' || "LatDD" || ')'
        FROM Localités;
        """
    DF = pd.read_sql_query(sql, db_string, index_col='id')
    di = BaseDataImporter(Plot, DF)
    di.process_import()
