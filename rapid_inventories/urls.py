# coding: utf-8

from django.conf.urls import url

from rapid_inventories import views


urlpatterns = [
    url(r'^$', views.rapid_inventories_index, name="rapid_inventory_index"),
    url(r'^add/$', views.add_rapid_inventory, name="add_rapid_inventory"),
    url(r'^([0-9]*)/$', views.consult_rapid_inventory),
    url(r'^([0-9]*)/delete/$', views.delete_rapid_inventory),
]
