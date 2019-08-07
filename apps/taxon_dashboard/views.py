# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from apps.niamoto_data.models import Occurrence
from django.db.models import Max, Min, Avg, Count

import apps.taxon_dashboard.analysis as a


@method_decorator(login_required, name='dispatch')
class TaxonTreeView(TemplateView):
    """
    Class-based view for taxon dashboards, where taxa are selected using
    a tree view.
    """
    template_name = "taxon_dashboard/taxon_treeview.html"
    taxa_tree_url = reverse_lazy("data-api:taxon-list")


class TaxonGeneralDashboardViewSet(ViewSet):
    """
    Viewset providing general dashboards for taxa.
    """

    def retrieve(self, request, pk=None):
        dataset = a.get_occurrences_by_taxon(pk)
        response = {
            "nb_occurrences": len(dataset),
            "total_nb_occurrences": Occurrence.objects.count(),
        }
        # height
        if self.request.query_params.get('include_height', None):
            response['height'] = a.get_stats(dataset, 'height')
        # dbh
        if self.request.query_params.get('include_dbh', None):
            response['dbh'] = a.get_stats(dataset, 'dbh')
        # distrubtion_dbh
        if self.request.query_params.get('include_dbh_class', None):
            response['dbh_class'] = a.get_dbh_classification(dataset)
        # wood_density
        if self.request.query_params.get('include_wood_density', None):
            response['wood_density'] = a.get_stats(dataset, 'wood_density')
        # bark_thickness
        if self.request.query_params.get('include_bark_thickness', None):
            response['bark_thickness'] = a.get_stats(dataset, 'bark_thickness')
        # stem_nb
        if self.request.query_params.get('include_stem_nb', None):
            response['stem_nb'] = a.get_stats(dataset, 'stem_nb')
        # stem_nb
        if self.request.query_params.get('include_rainfall', None):
            response['rainfall'] = a.get_stats(dataset, 'rainfall')
        # coordinates
        if self.request.query_params.get('include_coordinates', None):
            response['coordinates'] = a.get_coordinates(dataset)
        # taxon_distribution
        if self.request.query_params.get('include_taxon_distribution', None):
            response['taxon_distribution'] = a.get_taxon_distribution(dataset)
        # Environmental values
        if self.request.query_params.get('include_environmental_values', None):
            response['environmental_values'] = a.get_environmental_values(
                dataset)
        return Response(response)

    def list(self, request):
        return Response({})


class OccurrencesInfosViewSet(ViewSet):
    """
    Viewset providing Occurences general info for taxa.
    """

    def retrieve(self, request, pk=None):
        # response = a.get_occurrences_infos()
        response = {
            "dbh": get_stats(Occurrence, 'dbh'),
            "height": get_stats(Occurrence, 'height'),
            "wood_density": get_stats(Occurrence, 'wood_density'),
            "elevation": get_stats(Occurrence, 'elevation'),
            "rainfall": get_stats(Occurrence, 'rainfall'),
             }
        return Response(response)

    def list(self, request):
        return Response({})


def get_stats(model, field_name):
    """
        Generate dictionnaire aggregate
        :param model: A model app.
        :param field_name: The field_name to slice for the stats.
        :return: dict: Basic stats about
            a field of a dataset (count, min, max, avg).
    """
    response = model.objects.aggregate(
        Count(field_name),
        Min(field_name),
        Max(field_name),
        Avg(field_name),)
    # minimal name key
    response = {key.replace(field_name + '__', ''): response[key]
                for key in response.keys()}
    return response
