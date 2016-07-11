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
    queryset = Occurrence.objects.all()
    serializer_class = OccurrenceSerializer


class MassifViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'massif'
    queryset = Massif.objects.all()
    serializer_class = MassifSerializer
