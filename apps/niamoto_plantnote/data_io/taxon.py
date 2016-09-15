# coding: utf-8

import sqlite3

from django.db import connection

from apps.niamoto_data.models import Taxon


def _import_family_from_plantnote_db(database):
    sql = \
        """
        SELECT "ID Taxons", "Nom Complet", "Taxon", "ID Famille", 'FAMILY'
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NULL AND
            "ID Espèce" IS NULL AND
            "ID Infra" IS NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()
    return data


def _import_genus_from_plantnote_db(database):
    sql = \
        """
        SELECT "ID Taxons", "Nom Complet", "Taxon", "ID Famille", 'GENUS'
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NULL AND
            "ID Infra" IS NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()
    return data


def _import_specie_from_plantnote_db(database):
    sql = \
        """
        SELECT "ID Taxons", "Nom Complet", "Taxon", "ID Genre", 'SPECIE'
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NOT NULL AND
            "ID Infra" IS NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()
    return data


def _import_infra_from_plantnote_db(database):
    sql = \
        """
        SELECT "ID Taxons", "Nom Complet", "Taxon", "ID Espèce", 'INFRA'
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NOT NULL AND
            "ID Infra" IS NOT NULL;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()
    return data


def import_taxa(data):
    for row in data:
        id_tax, full_name, rank_name, id_parent, rank = row
        if id_parent == id_tax:
            parent = None
        else:
            parent = Taxon.objects.get(id=id_parent)
        Taxon.objects.create(
            id=id_tax,
            full_name=full_name,
            rank_name=rank_name,
            rank=rank,
            parent=parent,
        )


def delete_all_taxa():
    pg_sql = \
        """
        DELETE FROM {};
        """.format(Taxon._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)


def import_taxon_from_plantnote_db(database):
    """
    Import the taxon list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    family = _import_family_from_plantnote_db(database)
    genus = _import_genus_from_plantnote_db(database)
    specie = _import_specie_from_plantnote_db(database)
    infra = _import_infra_from_plantnote_db(database)
    import_taxa(family)
    import_taxa(genus)
    import_taxa(specie)
    import_taxa(infra)
