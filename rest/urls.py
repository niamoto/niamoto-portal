# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers


router = routers.DefaultRouter()


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^data/', include('apps.niamoto_data.rest_urls')),
    url(r'^plantnote/', include('apps.niamoto_plantnote.rest_urls')),
    url(r'^forest_digitizing/', include('apps.forest_digitizing.rest_urls')),
    url(r'^rapid_inventory/', include('apps.rapid_inventories.rest_urls')),
    url(r'^docs/', include('rest_framework_docs.urls')),
    url(r'^management/', include('apps.niamoto_management.rest_urls')),
]
