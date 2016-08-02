# coding: utf-8

import os
from os.path import isfile, join
from datetime import datetime

from django.core.management import execute_from_command_line
from django.conf import settings

from celery import shared_task
from celery.utils.log import get_task_logger


logger = get_task_logger(__name__)


@shared_task
def backup_db(path=None):
    """
    Use django-dbbackup to backup the niamoto database.
    """
    args = ["manage.py", "dbbackup"]
    if path is not None:
        args.append("-O")
        args.append(path)
    logger.info("Starting niamoto database backup...")
    execute_from_command_line(args)
    logger.info("Niamoto database backup complete!")


@shared_task
def monthly_backup_db():
    now = datetime.now()
    year = now.year
    month = now.month
    day = now.day
    filename = "niamoto-backup-monthly__{}-{}-{}.psql".format(
        year,
        month,
        day,
    )
    backup_db(join(settings.MONTHLY_BACKUPS_PATH, filename))
    limit_file_count(
        settings.MONTHLY_BACKUPS_PATH,
        settings.MAX_MONTHLY_BACKUP_COUNT
    )


@shared_task
def daily_backup_db():
    now = datetime.now()
    year = now.year
    month = now.month
    day = now.day
    filename = "niamoto-backup-daily__{}-{}-{}.psql".format(
        year,
        month,
        day,
    )
    backup_db(join(settings.DAILY_BACKUPS_PATH, filename))
    limit_file_count(
        settings.DAILY_BACKUPS_PATH,
        settings.MAX_DAILY_BACKUP_COUNT
    )


@shared_task
def hourly_backup_db():
    now = datetime.now()
    year = now.year
    month = now.month
    day = now.day
    hour = now.hour
    minute = now.minute
    filename = "niamoto-backup-hourly__{}-{}-{}_{}:{}.psql".format(
        year,
        month,
        day,
        hour,
        minute,
    )
    backup_db(join(settings.HOURLY_BACKUPS_PATH, filename))
    limit_file_count(
        settings.HOURLY_BACKUPS_PATH,
        settings.MAX_HOURLY_BACKUP_COUNT
    )


def limit_file_count(path, max_count):
    files = [f for f in os.listdir(path) if isfile(join(path, f))]
    if len(files) > max_count:
        s = sorted(files)
        for i in range(len(files) - max_count):
            os.remove(join(path, s[i]))
