# coding: utf-8

"""niamoto URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
from constance import config

from niamoto.views import AuthProxyView


urlpatterns = [
    url(r'^{}/'.format(settings.REST_API_BASE_URL), include(r'rest.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include('web.urls')),
    url(r'^digitizing/', include('apps.forest_digitizing.urls')),
    url(r"^inventory/", include("apps.inventories.urls")),
    url(r"^taxon_dashboards/", include("apps.taxon_dashboards.urls", namespace="taxon_dashboards")),
    url(r"^plot_dashboard/", include("apps.plot_dashboard.urls", namespace="plot_dashboard")),
    url(r'^explorer/', include('explorer.urls')),
    url(r'^qgis_plugin_repository/', include('qgis_plugin_repository.urls')),
    url(
        r'^geoserver/(?P<path>.*)$',
        AuthProxyView.as_view(upstream=config.GEOSERVER_BASE_URL)
    ),
    url(
        r'^flower/(?P<path>.*)$',
        AuthProxyView.as_view(upstream=config.FLOWER_BASE_URL)
    ),
]

if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
