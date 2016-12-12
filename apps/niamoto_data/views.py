# coding: utf-8

from rest_framework import viewsets

from apps.niamoto_data.models import Taxon, Occurrence, Plot
from apps.niamoto_data.serializers import TaxonSerializer, \
    OccurrenceSerializer, PlotSerializer


class TaxonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for retrieving taxa.
    """
    base_name = 'taxon'
    queryset = Taxon.objects.all()
    serializer_class = TaxonSerializer

    def list(self, request, *args, **kwargs):
        """
        Retrieve the list of taxa.
        """
        return super(TaxonViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a taxon given it's identifier.
        """
        return super(TaxonViewSet, self).retrieve(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Taxon.objects.all()
        full_name_like = self.request.query_params.get('full_name_like', None)
        if full_name_like is not None:
            queryset = queryset.filter(full_name__icontains=full_name_like)
        return queryset


class OccurrenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for retrieving occurrences.
    """
    base_name = 'occurrence'

    def get_queryset(self):
        return Occurrence.objects.select_related('observations')

    def get_serializer(self, *args, **kwargs):
        incl_obs = self.request.query_params.get('include_observations', None)
        if incl_obs:
            kwargs['include_observations'] = True
        return OccurrenceSerializer(*args, **kwargs)

    def list(self, request, *args, **kwargs):
        """
        Retrieve the list of occurrences.
        """
        return super(OccurrenceViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve an occurrence given it's identifier.
        """
        return super(OccurrenceViewSet, self).retrieve(request, *args, **kwargs)


class PlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for retrieving plots.
    """
    base_name = 'plot'
    filter_fields = {'name': ['icontains']}
    ordering_fields = ['name']

    def get_queryset(self):
        return Plot.objects.all()

    def get_serializer(self, *args, **kwargs):
        return PlotSerializer(*args, **kwargs)
