from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from apps.data_plot import models


class FrequencySerializer(serializers.ModelSerializer):
    """to output frequency properties

    Arguments:
        serializers {[type]} -- [description]
    """
    class Meta:
        model = models.Frequency

        fields = '__all__'


class PlotsSerializer(serializers.ModelSerializer):
    """to output all the plots

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = models.Plot

        fields = ('id', 'label', 'shannon', 'pielou', 'simpson', 'basal_area',
                  'h_mean', 'wood_density', 'biomasse', 'count_species',
                  'species_level')


class PlotSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output plot properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = FrequencySerializer(many=True, read_only=True)

    class Meta:
        model = models.Plot

        geo_field = 'location'
        fields = '__all__'
