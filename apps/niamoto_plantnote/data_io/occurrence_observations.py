# coding: utf-8

from django.db import transaction
import numpy as np
import pandas as pd

from apps.niamoto_data.models import OccurrenceObservations
from apps.data_importer import BaseDataImporter
from apps.niamoto_plantnote.data_io import get_plantnote_to_niamoto_ids


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

    group = df.groupby('plantnote_id')
    count = group.count()
    several = count[count['date_obs'] > 1]
    several_grouped = df[df['plantnote_id'].isin(several.index)].groupby(
        'plantnote_id'
    )
    unique_grouped = df[np.logical_not(
        df['plantnote_id'].isin(several.index)
    )].set_index('plantnote_id', drop=False)
    latests = several_grouped.apply(latest_observations)
    df = pd.concat([latests, unique_grouped])\
        .sort_values(by='plantnote_id')
    # Switch to niamoto's id
    plantnote_to_niamoto_ids = get_plantnote_to_niamoto_ids()
    df = pd.merge(df, plantnote_to_niamoto_ids, on="plantnote_id") \
        .set_index(['occurrence_id'], drop=False) \
        .drop('plantnote_id', 1)
    df.rename(columns={'date_obs': 'last_observation_date'}, inplace=True)
    di = BaseDataImporter(OccurrenceObservations, df)
    di.process_import()
