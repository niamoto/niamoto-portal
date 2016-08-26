# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.niamoto_plantnote.views import PlantnoteDatabaseViewSet


router = routers.DefaultRouter()

# Plantnote Database
router.register(
    r'{}'.format(PlantnoteDatabaseViewSet.base_name),
    PlantnoteDatabaseViewSet,
    base_name=PlantnoteDatabaseViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
