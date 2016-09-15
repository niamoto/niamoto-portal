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

    to_insert = dict()

    for row in data:
        id_indiv = row[0]
        date_str = row[1]
        d = get_date(date_str)
        height = row[2]
        stem_nb = row[3]
        circumference = row[4]
        status = row[5]
        wood_density = row[6]
        bark_thickness = row[7]

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
                "'{}'".format(row[0]),
                "'{}'".format(row[1]),
                "'{}'".format(row[2]) if row[2] is not None else "NULL",
                "'{}'".format(row[3]) if row[3] is not None else "NULL",
                "'{}'".format(row[4]) if row[4] is not None else "NULL",
                "'{}'".format(row[5]) if row[5] is not None else "NULL",
                "'{}'".format(row[6]) if row[6] is not None else "NULL",
                "'{}'".format(row[7]) if row[7] is not None else "NULL"
            ) for row in to_insert.values()])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
