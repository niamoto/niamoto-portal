# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.taxon_dashboard.views import TaxonGeneralDashboardViewSet
from apps.taxon_dashboard.views import OccurrencesInfosViewSet


router = routers.DefaultRouter()
router.register(
    r'taxon_dashboard',
    TaxonGeneralDashboardViewSet,
    base_name='taxon_dashboard',
)

# Occurrence
router.register(
    r'occurrences_infos',
    OccurrencesInfosViewSet,
    base_name='occurrences_infos',
)


urlpatterns = [
    url(r'^', include(router.urls)),
]
