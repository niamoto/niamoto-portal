# coding: utf-8

from django.conf.urls import url

from apps.taxon_dashboards.views import TaxonTreeView


urlpatterns = [
    url(r'^$', TaxonTreeView.as_view(), name="taxon_treeview"),
]
