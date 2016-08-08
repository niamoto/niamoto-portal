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
        SELECT Occ."ID Individus" AS id_indiv,
            Inv."ID Parcelle" AS id_plot
        FROM Individus AS Occ
        LEFT JOIN
          Inventaires AS Inv
        ON Occ."ID Inventaires" = Inv."ID Inventaires"
        WHERE Occ."ID Inventaires" IS NOT NULL;
        """
    conn = sqlite3.c # TODO
