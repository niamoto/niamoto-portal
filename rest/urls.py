# coding: utf-8

from django.conf.urls import url, include

from rest.views import api_root, whoami


urlpatterns = [
    url(r'^$', api_root, name="api-root"),
    url(r'^whoami/$', whoami, name="whoami"),
    url(r'^docs/', include('rest_framework_docs.urls', namespace="docs")),
    url(r'^data/', include('apps.niamoto_data.rest_urls', namespace="data-api")),
    url(r'^dashboard/', include('apps.taxon_dashboards.rest_urls', namespace="taxon_dashboard-api")),
    url(r'^plantnote/', include('apps.niamoto_plantnote.rest_urls', namespace="plantnote-api")),
    url(r'^forest_digitizing/', include('apps.forest_digitizing.rest_urls', namespace="forest_digitizing-api")),
    url(r'^inventory/', include('apps.inventories.rest_urls', namespace="inventory-api")),
    url(r'^management/', include('apps.niamoto_management.rest_urls', namespace="management-api")),
]
