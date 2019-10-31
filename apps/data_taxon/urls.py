from django.urls import path

from . import views

app_name = 'taxon'

urlpatterns = [
    path('donnees/', views.DashboardTaxonView.as_view(), name='dashboard'),
    path('', views.PresentationTaxonView.as_view(), name='presentation')
]
