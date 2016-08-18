# coding: utf-8

from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from rest_framework.pagination import PageNumberPagination

from apps.niamoto_data.models import Taxon, Occurrence, Massif, \
    OccurrenceObservations


class TaxonSerializer(serializers.ModelSerializer):
    """
    Serializer class for Taxon model, from niamoto-taxa app.
    """
    class Meta:
        model = Taxon
        fields = ('id', 'full_name', 'rank_name', 'parent', 'rank')


class OccurrenceObservationsSerializer(serializers.ModelSerializer):
    """
    Serializer for OccurrenceObservation model.
    """
    class Meta:
        model = OccurrenceObservations
        exclude = ('id', 'occurrence')


class OccurrenceSerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for Occurrence model, from niamoto-occurrences app.
    """

    observations = OccurrenceObservationsSerializer(read_only=True)

    class Meta:
        model = Occurrence
        geo_field = 'location'
        fields = ('id', 'date', 'taxon', 'observations')


class MassifSerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for Massif model, from niamoto-massifs app.
    """
    class Meta:
        model = Massif
        geo_field = 'geom'
        fields = ('key_name', 'full_name')
