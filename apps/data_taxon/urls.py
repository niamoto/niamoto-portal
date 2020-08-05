from django.urls import path, include
from rest_framework import routers


from . import views

app_name = 'taxon'

router = routers.SimpleRouter()
router.register(r'generalInfos', views.GeneralInfosViewSet, basename='generalInfos'
                )

urlpatterns = [
    path('donnees/', views.DashboardTaxonView.as_view(), name='dashboard'),
    path('', views.PresentationTaxonView.as_view(), name='presentation'),
    path('', include(router.urls))
]
