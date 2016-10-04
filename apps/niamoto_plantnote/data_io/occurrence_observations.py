# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection, transaction
import numpy as np
import pandas as pd

from apps.niamoto_data.models import OccurrenceObservations
from apps.niamoto_plantnote.models import PlantnoteOccurrence
from utils import fix_db_sequences


@transaction.atomic
def import_occurrence_observations_from_plantnote_db(database):
    """
    Import occurrence observations from a pl@ntnote database.
    :param database: The path to the database.
    """
    db_string = 'sqlite:////{}'.format(database)
    sql = \
        """
        SELECT Indiv."ID Individus" AS plantnote_id,
            Obs."date_observation" AS date_obs,
            Obs."hauteur" AS height,
            Obs."nb_tiges" AS stem_nb,
            Obs."perimeter" AS circumference,
            Obs."statut" AS status,
            Indiv."wood_density" AS wood_density,
            Indiv."bark_thickness" AS bark_thickness
        FROM Individus AS Indiv
        LEFT JOIN Observations AS Obs ON Indiv."ID Individus" = Obs."ID Individus"
        WHERE Obs."ID Observations" IS NOT NULL AND Indiv."ID Inventaires" IS NOT NULL
        ORDER BY plantnote_id, date_obs DESC;
        """
    df = pd.read_sql_query(sql, db_string)

    def first_val(col):
        i = col.first_valid_index()
        if i is None:
            return np.nan
        return col[i]

    def latest_observations(group):
        return group.apply(first_val, raw=True, axis=0)

    df = df.groupby('plantnote_id')\
        .apply(latest_observations)\
        .set_index('plantnote_id', drop=False)

    return df
