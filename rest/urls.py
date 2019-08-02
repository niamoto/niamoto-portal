# coding: utf-8

from django.conf.urls import url, include

from rest.views import api_root, whoami, get_digitizer_password


urlpatterns = [
    url(r'^$', api_root, name="api-root"),
    url(r'^whoami/$', whoami, name="whoami"),
    url(r'^digitizer_password/$', get_digitizer_password,
        name='digitizer_password'),
    url(r'^docs/', include('rest_framework_docs.urls', namespace="docs")),
    url(r'^data/', include('apps.niamoto_data.rest_urls',
        namespace="data-api")),
    url(r'^dashboard/taxon/', include('apps.taxon_dashboard.rest_urls',
        namespace="dashboard-taxon-api")),
    url(r'^dashboard/plot/', include('apps.plot_dashboard.rest_urls',
        namespace="dashboard-plot-api")),
    url(r'^data_mart/', include('apps.data_marts.rest_urls',
        namespace="data_mart-api")),
    url(r'^forest_digitizing/', include('apps.forest_digitizing.rest_urls',
        namespace="forest_digitizing-api")),
    url(r'^inventory/', include('apps.inventories.rest_urls',
        namespace="inventory-api")),
]
