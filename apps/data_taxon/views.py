from django.shortcuts import render
from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from django.http import HttpResponse
from django.template import loader
from .models import Graph, Taxon
from django.db.models import Max, Min, Avg, Count, Sum
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


class GeneralInfosViewSet(ViewSet):
    """
    Viewset providing taxons general info .
    """
    @method_decorator(cache_page(60*60*24*300))
    def retrieve(self, request, pk=None):

        response = {
            'occ_count_sum': list(Taxon.objects.filter(id_rang=10).aggregate(Sum('occ_count')).values())[0],
            'ncpippn_count_max': list(Taxon.objects.filter(id_rang=10).aggregate(Max('ncpippn_count')).values())[0],
            'dbh_max':  list(Taxon.objects.all().aggregate(Max('dbh_max')).values())[0],
            'dbh_min':  list(Taxon.objects.all().aggregate(Min('dbh_max')).values())[0],
            'height_max':  list(Taxon.objects.all().aggregate(Max('height_max')).values())[0],
            'height_min':  list(Taxon.objects.all().aggregate(Min('height_max')).values())[0],
            'wood_density_max':  list(Taxon.objects.all().aggregate(Max('wood_density_max')).values())[0],
            'bark_thickness_max':  list(Taxon.objects.all().aggregate(Max('bark_thickness_max')).values())[0],
            'leaf_sla_max':  list(Taxon.objects.all().aggregate(Max('leaf_sla_max')).values())[0],
            'leaf_area_max':  list(Taxon.objects.all().aggregate(Max('leaf_area_max')).values())[0],
            'leaf_thickness_max':  list(Taxon.objects.all().aggregate(Max('leaf_thickness_max')).values())[0],
            'leaf_ldmc_max':  list(Taxon.objects.all().aggregate(Max('leaf_ldmc_max')).values())[0],
            'freq_max':  list(Taxon.objects.all().aggregate(Max('freq_max')).values())[0],
            'freq10_max':  list(Taxon.objects.all().aggregate(Max('freq10_max')).values())[0],
            'freq_plot1ha_max':  list(Taxon.objects.all().aggregate(Max('freq_plot1ha_max')).values())[0],
            'freq_min':  list(Taxon.objects.all().aggregate(Min('freq_max')).values())[0],
            'freq10_min':  list(Taxon.objects.all().aggregate(Min('freq10_max')).values())[0],
            'freq_plot1ha_min':  list(Taxon.objects.all().aggregate(Min('freq_plot1ha_max')).values())[0],

        }

        return Response(response)

    def list(self, request):
        return Response({})
