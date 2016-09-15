# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection
import numpy as np

from apps.niamoto_data.models import Occurrence
from ..models import PlantnoteOccurrence


def get_occurrences_from_plantnote_db(database):
    """
    Select and return an occurrence list from a .ptx Pl@ntnote database,
    previously converted to a sqlite database.
    :param database: The path to the database.
    """
    sql = \
        """
        SELECT Indiv."ID Individus" AS id_indiv,
               COALESCE(Inv."Date Inventaire", "null") AS date_obs,
               COALESCE(Det."ID Taxons", "null") AS id_taxon,
               Col."Collecteur" AS col_name,
               "ST_GeomFromText('POINT(" || Loc.LongDD || " " || Loc.LatDD || "'), 4326)" AS location
        FROM Individus AS Indiv
        INNER JOIN Inventaires AS Inv ON Indiv."ID Inventaires" = Inv."ID Inventaires"
        LEFT JOIN Localités AS Loc ON Inv."ID Parcelle" = Loc."ID Localités"
        LEFT JOIN Déterminations AS Det ON Indiv."ID Déterminations" = Det."ID Déterminations"
        LEFT JOIN Observations AS Obs ON Indiv."ID Observations" = Obs."ID Observations"
        LEFT JOIN Collecteurs AS Col ON Obs."Observateur" = Col."ID Collecteurs";
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


def get_current_plantnote_occurrences():
    """
    :return: An array containing the occurrences in the niamoto's database
    coming from a Pl@ntnote database import.
    """
    pg_sql = \
        """
        SELECT o.id,
               o.date,
               'ST_GeomFromText(''POINT(' || ST_X(o.location) || ' ' || ST_Y(o.location) || '''), 4326)' AS location,
               o.taxon_id,
               p.plantnote_id,
               p.collector
       FROM {} AS p
       INNER JOIN {} AS o ON o.id = p.occurrence_ptr_id;
        """.format(PlantnoteOccurrence._meta.db_table, Occurrence._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)
    data = np.array(
        cursor.fetchall(),
        dtype=[
            ('id', 'int'),
            ('date_obs', 'U50'),
            ('location', 'U300'),
            ('tax_id', 'U50'),
            ('plantnote_id', 'int'),
            ('collector', 'U300'),
        ]
    )
    return data


def get_insert_selection(plantnote_data, niamoto_data):
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


def get_update_selection(plantnote_data, niamoto_data):
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
    to_update = ~np.all(np.equal(a, b), axis=1)
    return a[to_update]


def get_delete_selection(plantnote_data, niamoto_data):
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


def delete_all_occurrences():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(Occurrence._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_occurrences_from_plantnote_db(database):
    """
    Import an occurrence list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    sql = \
        """
        SELECT Indiv."ID Individus" AS id_indiv,
               Inv."Date Inventaire" AS date_obs,
               Det."ID Taxons" AS id_taxon,
               Col."Collecteur" AS col_name,
               Loc.LongDD,
               Loc.LatDD
        FROM Individus AS Indiv
        INNER JOIN Inventaires AS Inv ON Indiv."ID Inventaires" = Inv."ID Inventaires"
        LEFT JOIN Localités AS Loc ON Inv."ID Parcelle" = Loc."ID Localités"
        LEFT JOIN Déterminations AS Det ON Indiv."ID Déterminations" = Det."ID Déterminations"
        LEFT JOIN Observations AS Obs ON Indiv."ID Observations" = Obs."ID Observations"
        LEFT JOIN Collecteurs AS Col ON Obs."Observateur" = Col."ID Collecteurs";
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

    def get_date_col(row):
        date_str = row[1]
        if len(date_str) > 0:
            sd = date_str.split("/")
            if len(sd) == 3:
                d = date(*[int(i) for i in sd])
            elif len(sd) == 2:
                d = date(int(sd[0]), int(sd[1]), 1)
            else:
                d = date(int(sd[0]), 1, 1)
        return d

    def get_taxon_col(row):
        id_taxon = row[2]
        if id_taxon is None:
            return "null"
        return id_taxon

    # Now process bulk insert on PG database
    pg_sql = \
        """
        INSERT INTO {} (id, date, location, taxon_id)
        VALUES {};
        """.format(
            Occurrence._meta.db_table,
            ','.join(["('{}','{}',{}, {})".format(
                row[0],
                get_date_col(row),
                get_location_col(row),
                get_taxon_col(row),
            ) for row in data])
        )
    cursor = connection.cursor()
    cursor.execute(pg_sql)
