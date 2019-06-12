# coding: utf-8

from importlib import import_module

from django.apps import AppConfig


class WebConfig(AppConfig):
    name = 'web'

    def ready(self):
        import_module("web.receivers")
