# coding: utf-8

from django.conf.urls import url

from apps.taxon_dashboard import views


urlpatterns = [
    url(r'^$', views.TaxonTreeView.as_view(), name="taxon_treeview"),
]
