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
from rest_framework import routers
from restapi.views import TaxonViewSet, OccurrenceViewSet, \
    PlantnoteDatabaseViewSet, MassifViewSet


router = routers.DefaultRouter()
router.register(
    r'{}'.format(TaxonViewSet.base_name),
    TaxonViewSet,
    base_name=TaxonViewSet.base_name,

)
router.register(
    r'{}'.format(OccurrenceViewSet.base_name),
    OccurrenceViewSet,
    base_name=OccurrenceViewSet.base_name,
)
router.register(
    r'{}'.format(MassifViewSet.base_name),
    MassifViewSet,
    base_name=MassifViewSet.base_name,
)
router.register(
    r'{}'.format(PlantnoteDatabaseViewSet.base_name),
    PlantnoteDatabaseViewSet,
    base_name=PlantnoteDatabaseViewSet.base_name,
)


urlpatterns = [
    url(r'^{}/'.format(settings.REST_API_BASE_URL), include(router.urls)),
    url(r'^admin/', admin.site.urls),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^accounts/', include('account.urls')),
    url(r'^', include('web_portal.urls')),
    url(r'^digitizing/', include('niamoto_digitizing.urls')),
]

if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
