# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection, transaction
import numpy as np
from numpy.lib.recfunctions import append_fields

from apps.niamoto_data.models import Occurrence
from ..models import PlantnoteOccurrence
from utils import fix_db_sequences


@transaction.atomic
def import_occurrences_from_plantnote_db(database):
    """
    Import an occurrence list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    fix_db_sequences()
    plantnote_data = _get_occurrences_from_plantnote_db(database)
    niamoto_data = _get_current_plantnote_occurrences()
    insert_selection = _get_insert_selection(plantnote_data, niamoto_data)
    update_selection = _get_update_selection(plantnote_data, niamoto_data)
    delete_selection = _get_delete_selection(plantnote_data, niamoto_data)
    _insert_occurrences(insert_selection)
    _update_occurrences(update_selection)
    _delete_occurrences(delete_selection)


def _get_occurrences_from_plantnote_db(database):
    """
    Select and return an occurrence list from a .ptx Pl@ntnote database,
    previously converted to a sqlite database.
    :param database: The path to the database.
    """
    sql = \
        """
        SELECT Indiv."ID Individus" AS id_indiv,
               COALESCE(Inv."Date Inventaire", 'null') AS date_obs,
               COALESCE(Det."ID Taxons", 'null') AS id_taxon,
               Col."Collecteur" AS col_name,
               'POINT(' || Loc.LongDD || ' ' || Loc.LatDD || ')' AS location
        FROM Individus AS Indiv
        INNER JOIN Inventaires AS Inv ON Indiv."ID Inventaires" = Inv."ID Inventaires"
        LEFT JOIN Localités AS Loc ON Inv."ID Parcelle" = Loc."ID Localités"
        LEFT JOIN Déterminations AS Det ON Indiv."ID Déterminations" = Det."ID Déterminations"
        LEFT JOIN Observations AS Obs ON Indiv."ID Observations" = Obs."ID Observations"
        LEFT JOIN Collecteurs AS Col ON Obs."Observateur" = Col."ID Collecteurs"
        ORDER BY id_indiv;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = np.array(
        cur.fetchall(),
        dtype=[
            ('plantnote_id', 'int'),
            ('date_obs', 'U50'),
            ('tax_id', 'U50'),
            ('collector', 'U300'),
            ('location', 'U300')
        ]
    )
    # Fix dates
    for row in data:
        date_str = row['date_obs']
        if len(date_str) > 0:
            sd = date_str.split("/")
            if len(sd) == 3:
                row['date_obs'] = date(*[int(i) for i in sd])
            elif len(sd) == 2:
                row['date_obs'] = date(int(sd[0]), int(sd[1]), 1)
            else:
                row['date_obs'] = date(int(sd[0]), 1, 1)
    return data


def _get_current_plantnote_occurrences():
    """
    :return: An array containing the occurrences in the niamoto's database
    coming from a Pl@ntnote database import.
    """
    pg_sql = \
        """
        SELECT p.plantnote_id AS plantnote_id,
               o.date,
               COALESCE(o.taxon_id::text, 'null'),
               p.collector,
               'POINT(' || ST_X(o.location) || ' ' || ST_Y(o.location) || ')' AS location,
               o.id
       FROM {} AS p
       INNER JOIN {} AS o ON o.id = p.occurrence_ptr_id
       ORDER BY plantnote_id;
        """.format(PlantnoteOccurrence._meta.db_table, Occurrence._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)
    data = np.array(
        cursor.fetchall(),
        dtype=[
            ('plantnote_id', 'int'),
            ('date_obs', 'U50'),
            ('tax_id', 'U50'),
            ('collector', 'U300'),
            ('location', 'U300'),
            ('id', 'int'),
        ]
    )
    return data


def _get_insert_selection(plantnote_data, niamoto_data):
    diff = np.setdiff1d(
        plantnote_data['plantnote_id'],
        niamoto_data['plantnote_id'],
        assume_unique=True
    )
    bool_diff = np.in1d(
        plantnote_data['plantnote_id'],
        diff,
        assume_unique=True
    )
    return plantnote_data[bool_diff]


def _get_update_selection(plantnote_data, niamoto_data):
    intersect = np.intersect1d(
        plantnote_data['plantnote_id'],
        niamoto_data['plantnote_id'],
        assume_unique=True
    )
    if len(intersect) == 0:
        return []
    bool_diff_a = np.in1d(
        plantnote_data['plantnote_id'],
        intersect,
        assume_unique=True
    )
    bool_diff_b = np.in1d(
        niamoto_data['plantnote_id'],
        intersect,
        assume_unique=True
    )
    a = plantnote_data[bool_diff_a]
    b = niamoto_data[bool_diff_b]
    a = append_fields(a, 'id', b['id'], dtypes=b['id'].dtype, usemask=False)
    eq = a == b
    return a[~eq]


def _get_delete_selection(plantnote_data, niamoto_data):
    diff = np.setdiff1d(
        niamoto_data['plantnote_id'],
        plantnote_data['plantnote_id'],
        assume_unique=True
    )
    bool_diff = np.in1d(
        niamoto_data['plantnote_id'],
        diff,
        assume_unique=True
    )
    return niamoto_data[bool_diff]


@transaction.atomic
def _insert_occurrences(insert_selection):
    if len(insert_selection) == 0:
        return
    # Generate rows to insert in Occurrence base model
    values_occ = []
    for row in insert_selection:
        values_occ.append("('{}', ST_GeomFromText('{}', 4326), {})".format(
            row['date_obs'],
            row['location'],
            row['tax_id']
        ))
    # Insert records and returned assigned id's
    sql = \
        """
        WITH occ AS (
            INSERT INTO {} (date, location, taxon_id)
            VALUES {}
            RETURNING id
        )
        SELECT id FROM occ;
        """.format(Occurrence._meta.db_table, ','.join(values_occ))
    cursor = connection.cursor()
    cursor.execute(sql)
    ids = cursor.fetchall()
    # ids lenght should be equal to insert selection
    assert len(ids) == len(insert_selection)
    # Generate rows to insert in PlantnoteOccurrence extension model
    values_plantnote_occ = []
    for i, row in enumerate(insert_selection):
        values_plantnote_occ.append("({}, {}, '{}')".format(
            ids[i][0],
            row['plantnote_id'],
            row['collector'],
        ))
    # Insert records
    sql_plantnote_occ = \
        """
        INSERT INTO {} (occurrence_ptr_id, plantnote_id, collector)
        VALUES {};
        """.format(
            PlantnoteOccurrence._meta.db_table,
            ','.join(values_plantnote_occ)
        )
    cursor = connection.cursor()
    cursor.execute(sql_plantnote_occ)


@transaction.atomic
def _update_occurrences(update_selection):
    if len(update_selection) == 0:
        return
    # Update records in Occurrence base model
    updates = [
        """
        UPDATE {} SET date = '{}', location = ST_GeomFromText('{}', 4326), taxon_id = {}
        WHERE id = {}
        """ .format(
            Occurrence._meta.db_table,
            row['date_obs'],
            row['location'],
            row['tax_id'],
            row['id']
        )
        for row in update_selection
    ]
    cursor = connection.cursor()
    cursor.execute(';'.join(updates))
    # Update records in PlantnoteOccurrence extension model
    plantnote_updates = [
        """
        UPDATE {} SET collector = '{}'
        WHERE occurrence_ptr_id  = {}
        """.format(
            PlantnoteOccurrence._meta.db_table,
            row['collector'],
            row['id']
        )
        for row in update_selection
        ]
    cursor = connection.cursor()
    cursor.execute(';'.join(plantnote_updates))


@transaction.atomic
def _delete_occurrences(delete_selection):
    if len(delete_selection) == 0:
        return
    in_array = ','.join([str(i) for i in delete_selection['id']])
    sql = \
        """
        DELETE FROM {} WHERE occurrence_ptr_id IN ({});
        DELETE FROM {} WHERE id IN ({});
        """.format(
            PlantnoteOccurrence._meta.db_table,
            in_array,
            Occurrence._meta.db_table,
            in_array
        )
    cursor = connection.cursor()
    cursor.execute(sql)
