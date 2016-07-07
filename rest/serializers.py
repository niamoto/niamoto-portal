# coding: utf-8

from urllib import parse

from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from apps.niamoto_data.models import Taxon, Occurrence, Massif
from apps.niamoto_plantnote.models import PlantnoteDatabase


class TaxonSerializer(serializers.ModelSerializer):
    """
    Serializer class for Taxon model, from niamoto-taxa app.
    """
    class Meta:
        model = Taxon
        fields = ('id', 'full_name', 'rank_name', 'parent', 'rank')


class OccurrenceSerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for Occurrence model, from niamoto-occurrences app.
    """
    class Meta:
        model = Occurrence
        geo_field = 'location'
        fields = ('id', 'date', 'taxon')


class MassifSerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for Massif model, from niamoto-massifs app.
    """
    class Meta:
        model = Massif
        geo_field = 'geom'
        fields = ('key_name', 'full_name')


class PlantnoteDatabaseSerializer(serializers.ModelSerializer):
    """
    Serializer class for PlantnoteDatabase model, from niamoto-plantnote app.
    """

    file_url = serializers.SerializerMethodField()

    def get_file_url(self, instance):
        return parse.urljoin(
            'http://{}'.format(self.context['request'].get_host()),
            instance.file.url
        )

    class Meta:
        model = PlantnoteDatabase
        fields = (
            'uuid',
            'created_at',
            'updated_at',
            'active',
            'last_activated_at',
            'file_url',
        )
