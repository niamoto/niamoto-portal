# coding: utf-8

from celery import shared_task

from apps.niamoto_data.elevation_tools import set_occurrences_elevation, \
    set_plot_elevation


@shared_task
def update_occurrences_elevation():
    set_occurrences_elevation()


@shared_task
def update_plot_elevation():
    set_plot_elevation()
