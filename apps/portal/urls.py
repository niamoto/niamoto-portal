# coding: utf-8

from django.urls import include, path
from .views import home, methodologie

urlpatterns = [
    path('', home, name="home"),
    path('methodologie/', methodologie, name="methodologie"),
]
