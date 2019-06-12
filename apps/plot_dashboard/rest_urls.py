# coding: utf-8

from django.conf.urls import url, include
from rest_framework import routers

from apps.plot_dashboard.views import PlotDashboardViewSet


router = routers.DefaultRouter()
router.register(
    r'plot_dashboard',
    PlotDashboardViewSet,
    base_name='plot_dashboard',
)


urlpatterns = [
    url(r'^', include(router.urls)),
]
