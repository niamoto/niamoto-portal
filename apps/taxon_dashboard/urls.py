# coding: utf-8

from django.conf.urls import url

from apps.taxon_dashboard import views


urlpatterns = [
    url(r'^$', views.TaxonTreeView.as_view(), name="taxon_treeview"),
    url(r'^([0-9]*)/$', views.TaxonDetailedDashboardsView.as_view(), name="detailed_dashboards"),
]
