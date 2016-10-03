# coding: utf-8

from django.db import transaction
import pandas as pd

from apps.niamoto_data.models import Taxon
from apps.niamoto_plantnote.data_io.data_importer import BaseDataImporter


@transaction.atomic
def import_taxon_from_plantnote_db(database):
    """
    Import the taxon list from a .ptx Pl@ntnote database, previously
    converted to a sqlite database.
    :param database: The path to the database.
    """
    db_string = 'sqlite:////{}'.format(database)
    sql_family = \
        """
        SELECT "ID Taxons" AS id,
            "Nom Complet" AS full_name,
            "Taxon" AS rank_name,
            NULL AS parent_id,
            'FAMILY' AS rank,
            0 AS lft,
            0 AS rght,
            0 AS tree_id,
            0 AS level
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NULL AND
            "ID Espèce" IS NULL AND
            "ID Infra" IS NULL;
        """
    sql_genus = \
        """
        SELECT "ID Taxons" AS id,
            "Nom Complet" AS full_name,
            "Taxon" AS rank_name,
            "ID Famille" AS parent_id,
            'GENUS' AS rank,
            0 AS lft,
            0 AS rght,
            0 AS tree_id,
            0 AS level
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NULL AND
            "ID Infra" IS NULL;
        """
    sql_specie = \
        """
        SELECT "ID Taxons" AS id,
            "Nom Complet" AS full_name,
            "Taxon" AS rank_name,
            "ID Genre" AS parent_id,
            'SPECIE' AS rank,
            0 AS lft,
            0 AS rght,
            0 AS tree_id,
            0 AS level
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NOT NULL AND
            "ID Infra" IS NULL;
        """
    sql_infra = \
        """
        SELECT "ID Taxons" AS id,
            "Nom Complet" AS full_name,
            "Taxon" AS rank_name,
            "ID Espèce" AS parent_id,
            'INFRA' AS rank,
            0 AS lft,
            0 AS rght,
            0 AS tree_id,
            0 AS level
        FROM Taxons
        WHERE "ID Famille" IS NOT NULL AND
            "ID Genre" IS NOT NULL AND
            "ID Espèce" IS NOT NULL AND
            "ID Infra" IS NOT NULL;
        """
    # Family
    DF_family = pd.read_sql_query(sql_family, db_string)
    DF_family.set_index('id', inplace=True, drop=False)
    # Genus
    DF_genus = pd.read_sql_query(sql_genus, db_string)
    DF_genus.set_index('id', inplace=True, drop=False)
    # Specie
    DF_specie = pd.read_sql_query(sql_specie, db_string)
    DF_specie.set_index('id', inplace=True, drop=False)
    # Infra
    DF_infra = pd.read_sql_query(sql_infra, db_string)
    DF_infra.set_index('id', inplace=True, drop=False)
    # Concatenation
    DF = pd.concat([DF_family, DF_genus, DF_specie, DF_infra])
    update_fields = ['full_name', 'rank_name', 'parent_id', 'rank']
    di = BaseDataImporter(Taxon, DF, update_fields=update_fields)
    di.process_import()
    Taxon.objects.rebuild()
