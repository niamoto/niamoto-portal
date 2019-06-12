# coding: utf-8

from django.conf.urls import url

from apps.plot_dashboard import views


urlpatterns = [
    url(r'^$', views.PlotDashboardView.as_view(), name="plot_dashboard"),
]
