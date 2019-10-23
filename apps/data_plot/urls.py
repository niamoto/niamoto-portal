from django.urls import path

from . import views

urlpatterns = [
    path('donnees/', views.DashboardPlotView.as_view(), name='dashboard'),
    path('', views.PresentationPlotView.as_view(), name='presentation')
]
