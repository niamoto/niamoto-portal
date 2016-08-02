# coding: utf-8

import sqlite3

from django.db import connection

from apps.niamoto_data.models import Plot


def delete_all_plots():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(Plot._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_plots_from_plantnote_db(database):
    """
    Import a plot list from a Pl@ntnote database.
    :param database: The path to the plantnote database.
    """
    sql = \
        """
        SELECT Localités."ID Localités" AS id_plot,
            Localités."Nom Entier" AS name,
            Localités."Largeur" AS width,
            Localités."Hauteur" AS height
            Localités."LongDD" AS long,
            Localités."LatDD" AS lat,
        FROM Localités;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()

    def get_location_col(row):
        long = row[4]
        lat = row[5]
        if long is None or lat is None:
            return "NULL"
        else:
            return "ST_GeomFromText('POINT({} {})', 4326)".format(long, lat)

    pg_sql = \
        """
        INSERT INTO {} (id, name, width, height, location)
        VALUES {};
        """.format(
            Plot._meta.db_table,
            ','.join(["('{}', '{}', '{}', '{}', {}".format(
                row[0],
                row[1],
                row[2],
                row[3],
                get_location_col(row)
            ) for row in data])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
