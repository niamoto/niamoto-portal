# coding: utf-8

import sqlite3

from django.db import connection

from apps.niamoto_data.models import PlotOccurrences


def delete_all_plot_occurrences():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(PlotOccurrences._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_plot_occurrences_from_plantnote_db_(database):
    """
    Import the occurrence / plot correspondences from a pl@ntnote database.
    :param database: The path to the pl@ntnote database.
    """
    sql = \
        """
        SELECT Inv."ID Individus" AS id_indiv,
            Inv."ID Parcelle" AS id_plot,
            Inv."Identifiant" AS identifier
        FROM Inventaires AS Inv;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()

    def get_identifier_col(row):
        identifier = row[2]
        if identifier is None:
            return "NULL"
        return identifier

    # Insert data in database
    pg_sql = \
        """
        INSERT INTO {} (occurrence_id, plot_id)
        VALUES {};
        """.format(
            PlotOccurrences._meta.db_table,
            ','.join(["('{}', '{}', '{}')".format(
                row[0],
                row[1],
                get_identifier_col(row)
            ) for row in data])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
