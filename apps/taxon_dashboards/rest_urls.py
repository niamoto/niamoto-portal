# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.taxon_dashboards.views import (
    TaxonGeneralDashboardViewSet,
    get_coordinates
)


router = routers.DefaultRouter()
router.register(
    r'general_dashboard',
    TaxonGeneralDashboardViewSet,
    base_name='general_dashboard',
)


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^coordinates_for_taxon/([0-9]*)/$', get_coordinates, name="coordinates_for_taxon")
]
