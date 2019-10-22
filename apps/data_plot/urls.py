from django.urls import path

from . import views

urlpatterns = [
    path('dashboard/', views.DashboardPlotView.as_view(), name='dashboard')
]
