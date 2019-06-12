# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.forest_digitizing import views

router = routers.DefaultRouter()
router.register(
    r'{}'.format(views.MassifAssignationViewSet.base_name),
    views.MassifAssignationViewSet,
    base_name=views.MassifAssignationViewSet.base_name,
)

urlpatterns = [
    url(r'^', include(router.urls)),
]
