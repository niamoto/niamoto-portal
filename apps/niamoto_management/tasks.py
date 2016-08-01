# coding: utf-8

from django.core.management import execute_from_command_line

from celery import shared_task
from celery.utils.log import get_task_logger


logger = get_task_logger(__name__)


@shared_task
def backup_db():
    """
    Use django-dbbackup to backup the niamoto database.
    """
    logger.info("Starting niamoto database backup...")
    execute_from_command_line(["manage.py", "dbbackup"])
    logger.info("Niamoto database backup complete!")
