# coding: utf-8

from django.urls import include, path
from .views import home

urlpatterns = [
    path('', home, name="home"),
]