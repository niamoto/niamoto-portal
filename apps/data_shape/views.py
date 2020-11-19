from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.template import loader
from .models import Graph
from ..portal.models import SiteInfo

# Create your views here.


class DashboardShapeView(TemplateView):
    """
    Class-based view for shape dashboards page.
    """
    template_name = 'data_shape/dashboard.html'

    def get_context_data(self, **kwargs):
        graph_list = Graph.objects.filter(show=True).order_by('sort')
        siteinfos = SiteInfo.objects.all()
        return {
            'graph_list': graph_list,
            'siteinfos': siteinfos,
        }


class PresentationShapeView(TemplateView):

    template_name = 'data_shape/presentation.html'
    def get_context_data(self, **kwargs):
        siteInfos = SiteInfo.objects.all()
        return {
            'siteinfos': siteInfos
        }
