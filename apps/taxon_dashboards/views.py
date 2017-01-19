# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
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


@method_decorator(login_required, name='dispatch')
class TaxonDetailedDashboardsView(TemplateView):
    """
    Class-based view for taxon detailed dashboards.
    """
    template_name = "taxon_dashboards/detailed_dashboads.html"


class TaxonGeneralDashboardViewSet(ViewSet):
    """
    Viewset providing general dashboards for taxa.
    """

    def retrieve(self, request, pk=None):
        dataset = a.get_occurrences_by_taxon(pk)
        response = {
            "nb_occurrences": len(dataset),
            "total_nb_occurrences": a.get_occurrences_total_count(),
        }
        # height
        if self.request.query_params.get('include_height', None):
            response['height'] = a.get_stats(dataset, 'height')
        # dbh
        if self.request.query_params.get('include_dbh', None):
            response['dbh'] = a.get_stats(dataset, 'dbh')
        # wood_density
        if self.request.query_params.get('include_wood_density', None):
            response['wood_density'] = a.get_stats(dataset, 'wood_density')
        # bark_thickness
        if self.request.query_params.get('include_bark_thickness', None):
            response['bark_thickness'] = a.get_stats(dataset, 'bark_thickness')
        # stem_nb
        if self.request.query_params.get('include_stem_nb', None):
            response['stem_nb'] = a.get_stats(dataset, 'stem_nb')
        # coordinates
        if self.request.query_params.get('include_coordinates', None):
            response['coordinates'] = a.get_coordinates(dataset)
        # taxon_distribution
        if self.request.query_params.get('include_taxon_distribution', None):
            response['taxon_distribution'] = a.get_taxon_distribution(dataset)
        # Elevation range
        if self.request.query_params.get('include_environmental_values', None):
            response['environmental_values'] = a.get_environmental_values(dataset)
        return Response(response)

    def list(self, request):
        return Response({})
