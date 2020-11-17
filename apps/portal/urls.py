# coding: utf-8

from django.urls import include, path
from .views import home, MethologyView, RessouresView, maintenance

urlpatterns = [
    path('', home, name="home"),
    path('methodologie/', MethologyView.as_view(), name="methodologie"),
    path('ressources/', RessouresView.as_view(), name="ressources"),
    path('maintenance/', maintenance, name="maintenance"),
]
