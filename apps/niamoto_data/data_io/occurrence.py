# coding: utf-8

import sqlite3
from datetime import date

from django.db import connection

from apps.niamoto_data.models import Occurrence


def delete_all_occurrences():
    pg_sql = \
        """
        DELETE FROM {}
        """.format(Occurrence._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_occurrences_from_plantnode_db(database):
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
            Loc.LongDD, Loc.LatDD
        FROM Individus AS Indiv
        LEFT JOIN
            (SELECT "ID Inventaires", "Date Inventaire", "ID Parcelle"
             FROM Inventaires) AS Inv
        ON Indiv."ID Inventaires" = Inv."ID Inventaires"
        LEFT JOIN
            (SELECT "ID Localités", LongDD, LatDD
             FROM Localités) AS Loc
        ON Inv."ID Parcelle" = Loc."ID Localités"
        LEFT JOIN
            (SELECT "ID Déterminations", "ID Taxons"
             FROM Déterminations) AS Det
        ON Indiv."ID Déterminations" = Det."ID Déterminations"
        LEFT JOIN
            (SELECT "ID Observations", "Observateur"
             FROM Observations) AS Obs
        ON Indiv."ID Observations" = Obs."ID Observations"
        LEFT JOIN
            (SELECT "ID Collecteurs", "Collecteur"
             FROM Collecteurs) AS Col
        ON Obs."Observateur" = Col."ID Collecteurs"
        WHERE Indiv."ID Inventaires" IS NOT NULL;
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
