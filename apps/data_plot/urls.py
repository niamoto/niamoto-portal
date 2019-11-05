from django.urls import path
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from . import views

app_name = 'plot'

urlpatterns = [
    path('donnees/', cache_page(None)
         (views.DashboardPlotView.as_view()), name='dashboard'),
    path('', views.PresentationPlotView.as_view(), name='presentation')
]
