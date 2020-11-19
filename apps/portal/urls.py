# coding: utf-8

from django.urls import include, path
from .views import MethologyView, RessouresView, HomeView , maintenance

urlpatterns = [
    path('', HomeView.as_view(), name="home"),
    path('methodologie/', MethologyView.as_view(), name="methodologie"),
    path('ressources/', RessouresView.as_view(), name="ressources"),
    path('maintenance/', maintenance, name="maintenance"),
]
