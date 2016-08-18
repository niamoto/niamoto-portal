# coding: utf-8

from rest_framework import viewsets

from apps.niamoto_data.models import Taxon, Occurrence, Massif
from apps.niamoto_data.serializers import TaxonSerializer, \
    OccurrenceSerializer, MassifSerializer


class TaxonViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'taxon'
    queryset = Taxon.objects.all()
    serializer_class = TaxonSerializer


class OccurrenceViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'occurrence'

    def get_queryset(self):
        return Occurrence.objects.select_related('observations')

    def get_serializer(self, *args, **kwargs):
        incl_obs = self.request.query_params.get('include_observations', None)
        if incl_obs:
            kwargs['include_observations'] = True
        return OccurrenceSerializer(*args, **kwargs)


class MassifViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'massif'
    queryset = Massif.objects.all()
    serializer_class = MassifSerializer
