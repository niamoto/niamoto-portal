# coding: utf-8

from celery import shared_task

from apps.niamoto_data.environmental_tools import set_occurrences_elevation, \
    set_plots_elevation, set_occurrences_rainfall


@shared_task
def update_occurrences_environmental_data():
    set_occurrences_elevation()
    set_occurrences_rainfall()


@shared_task
def update_plots_environmental_data():
    set_plots_elevation()
