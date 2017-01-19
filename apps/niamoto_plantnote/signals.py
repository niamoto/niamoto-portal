# coding: utf-8

import os
import shutil

from django.db.models.signals import post_save, post_delete
from django.dispatch.dispatcher import receiver
from celery import group

from .models import PlantnoteDatabase
from .tasks import replace_plantnote_db, ensure_plantnote_db_only_active, \
    set_last_activated_at_value
from apps.niamoto_data.tasks import update_occurrences_environmental_data, \
    update_plots_environmental_data

@receiver(
    post_save,
    sender=PlantnoteDatabase,
    dispatch_uid="plantnote_db_post_save"
)
def plantnote_database_post_save(sender, **kwargs):
    instance = kwargs['instance']
    if instance.active:
        set_database_active(instance)


def set_database_active(instance):
    instance.active = False
    res = (
        replace_plantnote_db.s(instance.uuid) |
        ensure_plantnote_db_only_active.s() |
        set_last_activated_at_value.s()
    ).apply_async(link=group(
        update_plots_environmental_data.si(),
        update_occurrences_environmental_data.si()
    ))
    return res


@receiver(
    post_delete,
    sender=PlantnoteDatabase,
    dispatch_uid="plantnote_db_post_delete"
)
def delete_plantnote_database_file(sender, **kwargs):
    instance = kwargs['instance']
    if os.path.exists(instance.file.url):
        shutil.rmtree(os.path.dirname(instance.file.url))
