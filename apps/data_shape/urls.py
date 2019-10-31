from django.urls import path

from . import views

app_name = 'shape'

urlpatterns = [
    path('donnees/', views.DashboardShapeView.as_view(), name='dashboard'),
    path('', views.PresentationShapeView.as_view(), name='presentation')
]
