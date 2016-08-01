# coding: utf-8

from django.conf import settings
from celery.schedules import crontab


# Celery settings
CELERY_BROKER = 'amqp://niamoto-rabbitmq:5672//'
CELERY_BACKEND = 'amqp://niamoto-rabbitmq:5672//'
CELERY_TIMEZONE = settings.TIME_ZONE

# Celery Schedule
CELERYBEAT_SCHEDULE = {
    # Backup the database every first day of the month
    'monthly-db-backup': {
        'task': 'tasks.monthly_backup_db',
        'schedule': crontab(0, 0, day_of_month='1')
    },
    # Backup the database every day at midnight
    'daily-db-backup': {
        'task': 'tasks.daily_backup_db',
        'schedule': crontab(minute=0, hour=0)
    },
    # Backup the database every hour
    'hourly-db-backup': {
        'task': 'tasks.hourly_backup_db',
        'schedule': crontab(minute=0)
    }
}
