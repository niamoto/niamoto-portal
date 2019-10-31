from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.template import loader
from .models import Graph

# Create your views here.


class DashboardShapeView(TemplateView):
    """
    Class-based view for shape dashboards page.
    """
    template_name = 'data_shape/dashboard.html'

    def get_context_data(self, **kwargs):
        graph_list = Graph.objects.filter(show=True).order_by('sort')
        return {
            'graph_list': graph_list,
        }


class PresentationShapeView(TemplateView):

    template_name = 'data_shape/presentation.html'
