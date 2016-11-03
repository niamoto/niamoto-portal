# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.inventories.views import RapidInventoryViewSet


router = routers.DefaultRouter()

# Rapid inventory
router.register(
    r'{}'.format(RapidInventoryViewSet.base_name),
    RapidInventoryViewSet,
    base_name=RapidInventoryViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
