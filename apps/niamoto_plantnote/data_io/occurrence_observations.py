# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection, transaction
import numpy as np
import pandas as pd

from apps.niamoto_data.models import OccurrenceObservations
from apps.niamoto_plantnote.models import PlantnoteOccurrence


@transaction.atomic
def import_occurrence_observations_from_plantnote_db(database):
    """
    Import occurrence observations from a pl@ntnote database.
    :param database: The path to the database.
    """
    _delete_all_occurrence_observations()
    sql = \
        """
        SELECT Indiv."ID Individus" AS id_indiv,
            Obs."date_observation" AS date_obs,
            COALESCE(Obs."hauteur", 'NULL') AS height,
            COALESCE(Obs."nb_tiges", 'NULL') AS stem_nb,
            COALESCE(Obs."perimeter", 'NULL') AS circumference,
            COALESCE(Obs."statut", 'NULL') AS status,
            COALESCE(Indiv."wood_density", 'NULL') AS wood_density,
            COALESCE(Indiv."bark_thickness", 'NULL') AS bark_thickness
        FROM Individus AS Indiv
        LEFT JOIN Observations AS Obs ON Indiv."ID Individus" = Obs."ID Individus"
        WHERE Obs."ID Observations" IS NOT NULL AND Indiv."ID Inventaires" IS NOT NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = np.array(
        cur.fetchall(),
        dtype=[
            ('plantnote_id', 'int'),
            ('date_obs', 'U50'),
            ('height', 'U50'),
            ('stem_nb', 'U50'),
            ('circumference', 'U50'),
            ('status', 'U50'),
            ('wood_density', 'U50'),
            ('bark_thickness', 'U50'),
        ]
    )

    # Get niamoto occurrences ids corresponding to pl@ntnote ones
    cursor = connection.cursor()
    cursor.execute(
        """
        SELECT plantnote_id, occurrence_ptr_id
        FROM {}
        WHERE plantnote_id IN ({})
        ORDER BY plantnote_id;
        """.format(
            PlantnoteOccurrence._meta.db_table,
            ','.join([str(i) for i in data['plantnote_id']])
        )
    )
    niamoto_occ = np.array(
        cursor.fetchall(),
        dtype=[
            ('plantnote_id', 'int'),
            ('occurrence_id', 'int'),
        ]
    )

    # Now merge data on plantnote_id
    merged_data = pd.merge(
        pd.DataFrame(data),
        pd.DataFrame(niamoto_occ),
        on="plantnote_id",
        how='left'
    )

    def get_date(date_str):
        if len(date_str) > 0:
            sd = date_str.split("/")
            if len(sd) == 3:
                d = date(*[int(i) for i in sd])
            elif len(sd) == 2:
                d = date(int(sd[0]), int(sd[1]), 1)
            else:
                d = date(int(sd[0]), 1, 1)
        return d

    to_insert = dict()

    for index, row in merged_data.iterrows():
        id_indiv = row['occurrence_id']
        date_str = row['date_obs']
        d = get_date(date_str)
        height = row['height']
        stem_nb = row['stem_nb']
        circumference = row['circumference']
        status = row['status']
        wood_density = row['wood_density']
        bark_thickness = row['bark_thickness']

        if id_indiv not in to_insert:
            to_insert[id_indiv] = [
                id_indiv,
                d,
                height,
                stem_nb,
                circumference,
                status,
                wood_density,
                bark_thickness
            ]
        else:
            row = to_insert[id_indiv]
            current_date = row[1]
            current_height = row[2]
            current_stem_nb = row[3]
            current_circumference = row[4]
            current_status = row[5]
            current_wood_density = row[6]
            current_bark_thickness = row[7]
            b = current_date < d
            if not current_height or (b and height):
                row[2] = height
            if not current_stem_nb or (b and stem_nb):
                row[3] = stem_nb
            if not current_circumference or (b and circumference):
                row[4] = circumference
            if not current_status or (b and status):
                row[5] = status
            if not current_wood_density or (b and wood_density):
                row[6] = wood_density
            if not current_bark_thickness or (b and bark_thickness):
                row[7] = bark_thickness
            if b:
                row[1] = d

    # Now process bulk insert on PG database
    pg_sql = \
        """
        INSERT INTO {} (
            occurrence_id,
            last_observation_date,
            height,
            stem_nb,
            circumference,
            status,
            wood_density,
            bark_thickness
        )
        VALUES {};
        """.format(
            OccurrenceObservations._meta.db_table,
            ','.join(["({},{},{},{},{},{},{},{})".format(
                "{}".format(row[0]),
                "'{}'".format(row[1]),
                "{}".format(row[2]),
                "{}".format(row[3]),
                "{}".format(row[4]),
                row[5] if row[5] == 'NULL' else "'{}'".format(row[5]),
                "{}".format(row[6]),
                "{}".format(row[7])
            ) for row in to_insert.values()])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)


@transaction.atomic
def _delete_all_occurrence_observations():
    pg_sql = \
        """
        DELETE FROM {} AS occ_obs
        USING {} AS plantnote_occ
        WHERE occ_obs.occurrence_id = plantnote_occ.occurrence_ptr_id;
        """.format(
            OccurrenceObservations._meta.db_table,
            PlantnoteOccurrence._meta.db_table
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
