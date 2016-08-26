# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.niamoto_data.views import TaxonViewSet, OccurrenceViewSet


router = routers.DefaultRouter()

# Taxon
router.register(
    r'{}'.format(TaxonViewSet.base_name),
    TaxonViewSet,
    base_name=TaxonViewSet.base_name,
)
# Occurrence
router.register(
    r'{}'.format(OccurrenceViewSet.base_name),
    OccurrenceViewSet,
    base_name=OccurrenceViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
