# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from rest_framework.decorators import api_view
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

import apps.taxon_dashboards.analysis as a


@method_decorator(login_required, name='dispatch')
class TaxonTreeView(TemplateView):
    """
    Class-based view for taxon dashboards, where taxa are selected using
    a tree view.
    """
    template_name = "taxon_dashboards/taxon_treeview.html"
    taxa_tree_url = reverse_lazy("data-api:taxon-list")


class TaxonGeneralDashboardViewSet(ViewSet):
    """
    Viewset providing general dashboards for taxa.
    """

    def retrieve(self, request, pk=None):
        dataset = a.get_occurrences_by_taxon(pk)
        return Response({
            'height': a.get_height_stats(dataset),
            'circumference': a.get_circumference_stats(dataset),
            'wood_density': a.get_circumference_stats(dataset),
            'bark_thickness': a.get_bark_thickness_stats(dataset),
            'stem_nb': a.get_stem_nb_stats(dataset)
        })

    def list(self, request):
        return Response({})


@api_view(['GET'])
def get_coordinates(request, pk=None):
    dataset = a.get_occurrences_by_taxon(pk)
    return Response(a.get_coordinates(dataset))
