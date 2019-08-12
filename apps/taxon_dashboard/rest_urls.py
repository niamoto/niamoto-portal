# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.taxon_dashboard.views import TaxonGeneralDashboardViewSet
from apps.taxon_dashboard.views import GeneralInfosViewSet


router = routers.DefaultRouter()
router.register(
    r'taxon_dashboard',
    TaxonGeneralDashboardViewSet,
    base_name='taxon_dashboard',
)

# General Infos
router.register(
    r'general_infos',
    GeneralInfosViewSet,
    base_name='General_infos',
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
