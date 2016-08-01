# coding: utf-8

from django.conf.urls import url

from apps.niamoto_management import views


urlpatterns = [
    url(r'^trigger_backup', views.trigger_backup, name="trigger_backup"),
]
