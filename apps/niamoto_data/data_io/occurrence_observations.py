# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection

from apps.niamoto_data.models import OccurrenceObservations


def delete_all_occurrence_observations():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(OccurrenceObservations._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_occurrence_observations_from_plantnote_db(database):
    """
    Import occurrence observations from a pl@ntnote database.
    :param database: The path to the database.
    """
    sql = \
        """
        SELECT Indiv."ID Individus" AS id_indiv,
            Obs."ID Observations" AS id_obs,
            Obs."date_observation" AS date_obs,
            Obs."hauteur" AS height,
            Obs."nb_tiges" AS stem_nb,
            Obs."perimeter" AS circumference,
            Obs."statut" AS status,
            Indiv."wood_density" AS wood_density,
            Indiv."bark_thickness" AS bark_thickness
        FROM Individus AS Indiv
        LEFT JOIN Observations AS Obs ON Indiv."ID Individus" = Obs."ID Individus"
        WHERE Obs."ID Observations" IS NOT NULL AND Indiv."ID Inventaires" IS NOT NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()

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

    to_insert = list()

    for row in data:
        id_indiv = row[0]
        id_obs = row[1]
        date_str = row[2]
        d = get_date(date_str)
        height = row[3]
        stem_nb = row[4]
        circumference = row[5]
        status = row[6]
        wood_density = row[7]
        bark_thickness = row[8]
        to_insert.append((
            id_obs,
            id_indiv,
            d,
            height,
            stem_nb,
            circumference,
            status,
            wood_density,
            bark_thickness
        ))

    # Now process bulk insert on PG database
    pg_sql = \
        """
        INSERT INTO {} (
            id,
            occurrence_id,
            observation_date,
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
            ','.join(["({},{},{},{},{},{},{},{},{})".format(
                "'{}'".format(row[0]),
                "'{}'".format(row[1]),
                "'{}'".format(row[2]),
                "'{}'".format(row[3]) if row[3] is not None else "NULL",
                "'{}'".format(row[4]) if row[4] is not None else "NULL",
                "'{}'".format(row[5]) if row[5] is not None else "NULL",
                "'{}'".format(row[6]) if row[6] is not None else "NULL",
                "'{}'".format(row[7]) if row[7] is not None else "NULL",
                "'{}'".format(row[8]) if row[8] is not None else "NULL"
            ) for row in to_insert])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
