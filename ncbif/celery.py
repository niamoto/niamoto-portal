# coding: utf-8

from __future__ import absolute_import

import os

from celery import Celery
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ncbif.settings')

app = Celery(
    'ncbif',
    broker='amqp://',
    backend='amqp://',
    include=['ncbif.tasks'],
)

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
