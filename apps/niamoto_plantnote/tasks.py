# coding: utf-8

from __future__ import absolute_import
from datetime import datetime

from django.db import transaction
from celery import shared_task
from celery.utils.log import get_task_logger

from .data_io import taxon as taxon_io
from .data_io import occurrence as occurrence_io
from .data_io import plot as plot_io
from .data_io import plot_occurrences as plot_occs_io
from .data_io import occurrence_observations as occ_obs_io
from .models import PlantnoteDatabase
from utils import fix_db_sequences


logger = get_task_logger(__name__)


@shared_task
def replace_plantnote_db(db_uuid):
    """
    Replace the current plantnote db on which taxa and occurrences records
    are based.
    :param db_uuid: The uuid of the plantnote database record to work on.
    :return: The db uuid.
    """
    logger.debug('Loading PlantnoteDatabase object {}'.format(db_uuid))
    db = PlantnoteDatabase.objects.get(uuid=db_uuid)
    url = db.file.path
    logger.debug('PlantnoteDatabase object {} loaded'.format(db_uuid))
    logger.debug('Db file url is: "{}"'.format(url))
    with transaction.atomic():
        fix_db_sequences()
        taxon_io.import_taxon_from_plantnote_db(url)
        occurrence_io.import_occurrences_from_plantnote_db(url)
        plot_io.import_plots_from_plantnote_db(url)
        plot_occs_io.import_plot_occurrences_from_plantnote_db(url)
        occ_obs_io.import_occurrence_observations_from_plantnote_db(url)
        fix_db_sequences()
    return db_uuid


@shared_task
def ensure_plantnote_db_only_active(db_uuid):
    """
    Ensure that the database with the given uuid is set as active, and ensure
    that no other database is marked as active.
    :param db_uuid: The uuid of the plantnote database record to work on.
    :return: The db uuid.
    """
    db = PlantnoteDatabase.objects.get(uuid=db_uuid)
    to_true = PlantnoteDatabase.objects.filter(active=True)
    if not db.active:
        queryset = PlantnoteDatabase.objects.filter(uuid=db_uuid)
        queryset.update(active=True)
    for record in to_true:
        if record != db:
            record.active = False
            record.save()
    return db_uuid


@shared_task
def set_last_activated_at_value(db_uuid):
    """
    Update the last_activated_at value for the given database.
    :param db_uuid: The uuid of the plantnote database record to work on.
    :return: The db uuid.
    """
    db = PlantnoteDatabase.objects.get(uuid=db_uuid)
    assert db.active  # Prevent silent strange behavior
    queryset = PlantnoteDatabase.objects.filter(uuid=db_uuid)
    queryset.update(last_activated_at=datetime.now())
    return db_uuid
