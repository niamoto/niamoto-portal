# coding: utf-8

from rest_framework import viewsets
from rest_framework import filters

from apps.niamoto_plantnote.models import PlantnoteDatabase
from apps.niamoto_plantnote.serializers import PlantnoteDatabaseSerializer


class PlantnoteDatabaseViewSet(viewsets.ReadOnlyModelViewSet):
    base_name = 'plantnote_database'
    queryset = PlantnoteDatabase.objects.all()
    serializer_class = PlantnoteDatabaseSerializer
    filter_backends = (filters.DjangoFilterBackend, )
    filter_fields = ('active', )
