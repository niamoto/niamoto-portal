from django.urls import path

from . import views

app_name = 'plot'

urlpatterns = [
    path('donnees/', views.DashboardPlotView.as_view(), name='dashboard'),
    path('', views.PresentationPlotView.as_view(), name='presentation')
]
