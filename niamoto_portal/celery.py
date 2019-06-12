# coding: utf-8

from __future__ import absolute_import

import os

from celery import Celery
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'niamoto_portal.settings')

app = Celery(
    'niamoto_portal',
    broker=settings.CELERY_BROKER,
    backend=settings.CELERY_BACKEND,
    include=['niamoto_portal.tasks'],
)

app.config_from_object('niamoto_portal.celeryconfig')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
