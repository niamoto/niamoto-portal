# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.niamoto_management import views


router = routers.DefaultRouter()

# Users
router.register(
    r'{}'.format(views.UserViewSet.base_name),
    views.UserViewSet,
    base_name=views.UserViewSet.base_name,
)


urlpatterns = [
    url(r'^trigger_backup/', views.trigger_backup, name="trigger_backup"),
    url(r'^', include(router.urls)),
]
