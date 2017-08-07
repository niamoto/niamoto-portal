# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.data_marts.views import ProvinceDimensionViewSet, \
    CommuneDimensionViewSet, RainfallVectorClassesViewSet, \
    ElevationVectorClassesViewSet, process


router = routers.DefaultRouter()
router.register(
    r'province_dimension',
    ProvinceDimensionViewSet,
    base_name='province_dimension',
)
router.register(
    r'commune_dimension',
    CommuneDimensionViewSet,
    base_name='province_dimension',
)
router.register(
    r'rainfall_vector_classes',
    RainfallVectorClassesViewSet,
    base_name='rainfall_vector_classes',
)
router.register(
    r'elevation_vector_classes',
    ElevationVectorClassesViewSet,
    base_name='elevation_vector_classes',
)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^process/', process),
]
