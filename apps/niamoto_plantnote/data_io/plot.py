# coding: utf-8

import sqlite3

from django.db import connection, transaction

from apps.niamoto_data.models import Plot


@transaction.atomic
def import_plots_from_plantnote_db(database):
    """
    Import a plot list from a Pl@ntnote database.
    :param database: The path to the plantnote database.
    """
    _delete_all_plots()
    sql = \
        """
        SELECT "ID Localités" AS id_plot,
            "Nom Entier" AS name,
            "Largeur" AS width,
            "Longueur" AS height,
            "LongDD" AS long,
            "LatDD" AS lat
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
        return "ST_GeomFromText('POINT({} {})', 4326)".format(long, lat)

    def get_width_row(row):
        width = row[2]
        if width is None or width == 'None':
            return "NULL"
        return width

    def get_height_row(row):
        height = row[3]
        if height is None or height == 'None':
            return "NULL"
        return height

    pg_sql = \
        """
        INSERT INTO {} (id, name, width, height, location)
        VALUES {};
        """.format(
            Plot._meta.db_table,
            ','.join(["('{}', '{}', {}, {}, {})".format(
                row[0],
                row[1],
                get_width_row(row),
                get_height_row(row),
                get_location_col(row)
            ) for row in data if row[0] not in (None, 'None')])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)


@transaction.atomic
def _delete_all_plots():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(Plot._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)
