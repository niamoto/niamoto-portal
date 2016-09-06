# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.taxon_dashboards import views


router = routers.DefaultRouter()

urlpatterns = [
    # url(r'^', include(router.urls)),
]
