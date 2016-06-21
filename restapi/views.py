# coding: utf-8

from rest_framework import viewsets
from rest_framework import filters

from niamoto_taxa.models import Taxon
from niamoto_occurrences.models import Occurrence
from niamoto_plantnote.models import PlantnoteDatabase
from restapi.serializers import TaxonSerializer, OccurrenceSerializer, \
    PlantnoteDatabaseSerializer


class TaxonViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'taxon'
    queryset = Taxon.objects.all()
    serializer_class = TaxonSerializer


class OccurrenceViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'occurrence'
    queryset = Occurrence.objects.all()
    serializer_class = OccurrenceSerializer


class PlantnoteDatabaseViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'plantnote_database'
    queryset = PlantnoteDatabase.objects.all()
    serializer_class = PlantnoteDatabaseSerializer
    filter_backends = (filters.DjangoFilterBackend, )
    filter_fields = ('active', )
