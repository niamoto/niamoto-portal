# coding: utf-8

from django.conf.urls import url

from apps.data_marts import views


urlpatterns = [
    url(r'^$', views.DataMartView.as_view(), name="data_mart"),
]
