# coding: utf-8

from django.apps import AppConfig


class NiamotoPlantnoteConfig(AppConfig):
    name = 'apps.niamoto_plantnote'

    def ready(self):
        import apps.niamoto_plantnote.signals

