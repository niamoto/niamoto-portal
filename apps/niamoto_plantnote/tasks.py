# coding: utf-8

from __future__ import absolute_import
from datetime import datetime

from celery import shared_task
from celery.utils.log import get_task_logger

from .models import PlantnoteDatabase


logger = get_task_logger(__name__)


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
