# coding: utf-8

from __future__ import absolute_import

from django.db import transaction
from celery import shared_task

from ncbif_taxa import data_io as taxa_io
from ncbif_occurrences import data_io as occurrences_io


@shared_task
def replace_plantnote_db(plantnote_db):
    """
    Replace the current plantnote db on which taxa and occurrences records
    are based.
    :param plantnote_db: The path to the plantnote db, previously converted to
    sqlite.
    """
    with transaction.atomic():
        occurrences_io.delete_all_occurrences()
        taxa_io.delete_all_taxa()
        taxa_io.import_taxon_from_plantnote_db(plantnote_db)
        occurrences_io.import_occurrences_from_plantnode_db(plantnote_db)
