# coding: utf-8

from django.conf.urls import url

from apps.inventories import views


urlpatterns = [
    # Rapid inventories
    url(r'^rapid_inventory/$', views.rapid_inventories_index, name="rapid_inventory_index"),
    url(r'^rapid_inventory/add/$', views.add_rapid_inventory, name="add_rapid_inventory"),
    url(r'^rapid_inventory/([0-9]*)/$', views.consult_rapid_inventory),
    url(r'^rapid_inventory/([0-9]*)/delete/$', views.delete_rapid_inventory),
    # Taxa inventories
    url(r'^taxa_inventory/$', views.taxa_inventories_index, name="taxa_inventory_index"),
    url(r'^taxa_inventory/add/$', views.TaxaInventoryFormView.as_view(), name="taxa_inventory"),
    url(r'^taxa_inventory/(?P<pk>[0-9]*)/$', views.TaxaInventoryUpdateView.as_view(), name="taxa_inventory_consult"),
    url(r'^taxa_inventory/(?P<pk>[0-9]*)/delete/$', views.TaxaInventoryDeleteView.as_view(), name="taxa_inventory_delete"),
]
