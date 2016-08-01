# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.forest_digitizing.views import MassifAssignationViewSet
from apps.niamoto_data.views import TaxonViewSet, OccurrenceViewSet, \
    MassifViewSet
from apps.niamoto_plantnote.views import PlantnoteDatabaseViewSet
from apps.rapid_inventories.views import RapidInventoryViewSet
from rest.views import UserViewSet

router = routers.DefaultRouter()
# Users
router.register(
    r'{}'.format(UserViewSet.base_name),
    UserViewSet,
    base_name=UserViewSet.base_name,
)
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
# Massif
router.register(
    r'{}'.format(MassifViewSet.base_name),
    MassifViewSet,
    base_name=MassifViewSet.base_name,
)
# Plantnote Database
router.register(
    r'{}'.format(PlantnoteDatabaseViewSet.base_name),
    PlantnoteDatabaseViewSet,
    base_name=PlantnoteDatabaseViewSet.base_name,
)
# Rapid inventory
router.register(
    r'{}'.format(RapidInventoryViewSet.base_name),
    RapidInventoryViewSet,
    base_name=RapidInventoryViewSet.base_name,
)
# Digitizing massif assignation
router.register(
    r'{}'.format(MassifAssignationViewSet.base_name),
    MassifAssignationViewSet,
    base_name=MassifAssignationViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include('apps.niamoto_management.rest_urls'))
]
