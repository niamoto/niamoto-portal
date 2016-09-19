# coding: utf-8

import sqlite3

from django.db import connection, transaction
import numpy as np
import pandas as pd

from apps.niamoto_data.models import PlotOccurrences
from apps.niamoto_plantnote.models import PlantnoteOccurrence


@transaction.atomic
def import_plot_occurrences_from_plantnote_db(database):
    """
    Import the occurrence / plot correspondences from a pl@ntnote database.
    :param database: The path to the pl@ntnote database.
    """
    _delete_all_plot_occurrences()
    # Get plantnote data
    sql = \
        """
        SELECT Inv."ID Individus" AS id_indiv,
            Inv."ID Parcelle" AS id_plot,
            COALESCE (Inv."Identifiant", 'NULL') AS identifier
        FROM Inventaires AS Inv
        ORDER BY id_indiv;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    plantnote_plot_occ = np.array(
        cur.fetchall(),
        dtype=[
            ('plantnote_id', 'int'),
            ('plot_id', 'int'),
            ('identifier', 'U50'),
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
            ','.join([str(i) for i in plantnote_plot_occ['plantnote_id']])
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
        pd.DataFrame(plantnote_plot_occ),
        pd.DataFrame(niamoto_occ),
        on="plantnote_id",
        how='left'
    )

    # Insert data in database
    pg_sql = \
        """
        INSERT INTO {} (occurrence_id, plot_id, identifier)
        VALUES {};
        """.format(
            PlotOccurrences._meta.db_table,
            ','.join(["('{}', '{}', {})".format(
                row['occurrence_id'],
                row['plot_id'],
                row['identifier'] if row[2] == 'NULL'
                else "'{}'".format(row['identifier']),
            ) for index, row in merged_data.iterrows()])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)


@transaction.atomic
def _delete_all_plot_occurrences():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(PlotOccurrences._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)
