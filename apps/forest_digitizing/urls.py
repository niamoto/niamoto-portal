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
    url(r'^$', views.massifs_index, name='digitizing_massifs'),
    url(r'^([a-z_]*)/$', views.forest_index, name='digitizing_forest'),
    url(r'^([a-z_]*)/add_problem$', views.add_problem, name='add_problem'),
    url(r'^([a-z_]*)/delete_problem$', views.delete_problem, name='delete_problem'),
]


rest_urlpatterns = [
    url(r'^', include(router.urls)),
]
