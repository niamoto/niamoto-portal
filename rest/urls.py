# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.niamoto_data.views import TaxonViewSet, OccurrenceViewSet, \
    MassifViewSet
from apps.niamoto_plantnote.views import PlantnoteDatabaseViewSet
from apps.rapid_inventories.views import RapidInventoryViewSet


router = routers.DefaultRouter()
router.register(
    r'{}'.format(TaxonViewSet.base_name),
    TaxonViewSet,
    base_name=TaxonViewSet.base_name,

)
router.register(
    r'{}'.format(OccurrenceViewSet.base_name),
    OccurrenceViewSet,
    base_name=OccurrenceViewSet.base_name,
)
router.register(
    r'{}'.format(MassifViewSet.base_name),
    MassifViewSet,
    base_name=MassifViewSet.base_name,
)
router.register(
    r'{}'.format(PlantnoteDatabaseViewSet.base_name),
    PlantnoteDatabaseViewSet,
    base_name=PlantnoteDatabaseViewSet.base_name,
)
router.register(
    r'{}'.format(RapidInventoryViewSet.base_name),
    RapidInventoryViewSet,
    base_name=RapidInventoryViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
