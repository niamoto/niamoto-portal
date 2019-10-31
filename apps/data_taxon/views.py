from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.template import loader
from .models import Graph

# Create your views here.


class DashboardTaxonView(TemplateView):
    """
    Class-based view for taxon dashboards page.
    """
    template_name = 'data_taxon/dashboard.html'

    def get_context_data(self, **kwargs):
        graph_list = Graph.objects.filter(show=True).order_by('sort')
        return {
            'graph_list': graph_list,
        }


class PresentationTaxonView(TemplateView):

    template_name = 'data_taxon/presentation.html'
