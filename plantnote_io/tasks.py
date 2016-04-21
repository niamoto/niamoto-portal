# coding: utf-8

from __future__ import absolute_import

from celery import shared_task

from ncbif_taxa.data_io import delete_all_taxa, import_taxon_from_plantnote_db
from ncbif_occurrences.data_io import delete_all_occurrences, \
    import_occurrences_from_plantnode_db


@shared_task
def replace_taxa_from_plantnote_db(plantnote_db):
    delete_all_taxa()
    import_taxon_from_plantnote_db(plantnote_db)


@shared_task
def replace_occurrences_from_plantnote_db(plantnote_db):
    delete_all_occurrences()
    import_occurrences_from_plantnode_db(plantnote_db)
