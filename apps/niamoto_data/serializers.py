# coding: utf-8

from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from apps.niamoto_data.models import Taxon, Occurrence, Plot


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

    observations = ['height', 'stem_nb', 'dbh', 'status', 'wood_density',
                    'bark_thickness', 'elevation', 'rainfall']

    class Meta:
        model = Occurrence
        geo_field = 'location'
        fields = ['id', 'date', 'taxon']

    def __init__(self, *args, **kwargs):
        include_observations = kwargs.pop('include_observations', False)
        super(OccurrenceSerializer, self).__init__(*args, **kwargs)
        if include_observations:
            self.fields += self.observations


class PlotSerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer for Plot model.
    """

    class Meta:
        model = Plot
        geo_field = 'location'
        fields = ('id', 'name', 'width', 'height', 'elevation', 'basal_area')

