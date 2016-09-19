# coding: utf-8

import sqlite3

from django.db import connection, transaction
import numpy as np

from apps.niamoto_data.models import Taxon
from utils import fix_db_sequences


@transaction.atomic
def import_taxon_from_plantnote_db(database):
    """
    Import the taxon list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    _delete_all_taxa()
    family = _import_family_from_plantnote_db(database)
    genus = _import_genus_from_plantnote_db(database)
    specie = _import_specie_from_plantnote_db(database)
    infra = _import_infra_from_plantnote_db(database)
    _import_taxa(family)
    _import_taxa(genus)
    _import_taxa(specie)
    _import_taxa(infra)


def _get_plantnote_taxa(database):
    sql = \
        """
        SELECT "ID Taxons", "Nom Complet", "Taxon", "ID Famille",
            "ID Genre", "ID Espèce", "ID Infra"
        FROM Taxons;
        """
    conn = sqlite3.connect(database)
    cur = conn.cursor()
    cur.execute(sql)
    data = np.array(cur.fetchall())
    return data


def _get_niamoto_taxa():
    sql = \
        """
        SELECT id, full_name, rank_name, rank, parent_id
        FROM {};
        """.format(Taxon._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(sql)
    data = np.array(cursor.fetchall())
    return data


def _get_insert_selection(plantnote_data, niamoto_data):
    diff = np.setdiff1d(
        plantnote_data[:, 0],
        niamoto_data[:, 0],
        assume_unique=True
    )
    bool_diff = np.in1d(
        plantnote_data[:, 0],
        diff,
        assume_unique=True
    )
    return plantnote_data[bool_diff]


def _get_delete_selection(plantnote_data, niamoto_data):
    diff = np.setdiff1d(
        niamoto_data[:, 0],
        plantnote_data[:, 0],
        assume_unique=True
    )
    bool_diff = np.in1d(
        niamoto_data[:, 0],
        diff,
        assume_unique=True
    )
    return niamoto_data[bool_diff]


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


@transaction.atomic
def _import_taxa(data):
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


@transaction.atomic
def _delete_all_taxa():
    pg_sql = \
        """
        DELETE FROM {};
        """.format(Taxon._meta.db_table)
    cursor = connection.cursor()
    cursor.execute(pg_sql)
    fix_db_sequences()
