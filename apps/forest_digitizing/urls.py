# coding: utf-8

from django.conf.urls import url

from apps.forest_digitizing import views


urlpatterns = [
    url(r'^$', views.massifs_index, name='digitizing_massifs'),
    url(r'^([a-z_]*)/$', views.forest_index, name='digitizing_forest'),
    url(r'^([a-z_]*)/add_problem$', views.add_problem, name='add_problem'),
    url(r'^([a-z_]*)/delete_problem$', views.delete_problem, name='delete_problem'),
]
