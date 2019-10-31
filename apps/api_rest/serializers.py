from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from apps.data_plot import models as mdlPlot
from apps.data_shape import models as mdlShape


class PlotFrequencySerializer(serializers.ModelSerializer):
    """to output frequency properties

    Arguments:
        serializers {[type]} -- [description]
    """
    class Meta:
        model = mdlPlot.Frequency

        fields = '__all__'


class PlotsSerializer(serializers.ModelSerializer):
    """to output all the plots

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlPlot.Plot

        fields = ('id', 'label', 'shannon', 'pielou', 'simpson', 'basal_area',
                  'h_mean', 'wood_density', 'biomasse', 'count_species',
                  'species_level')


class PlotSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output plot properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = PlotFrequencySerializer(many=True, read_only=True)

    class Meta:
        model = mdlPlot.Plot

        geo_field = 'location'
        fields = '__all__'


class ShapeFrequencySerializer(serializers.ModelSerializer):
    """to output frequency properties

    Arguments:
        serializers {[type]} -- [description]
    """
    class Meta:
        model = mdlShape.Frequency

        fields = '__all__'


class ShapesSerializer(serializers.ModelSerializer):
    """to output all the shapes

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlShape.Shape

        fields = '__all__'


class ShapeSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output shape properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = ShapeFrequencySerializer(many=True, read_only=True)

    class Meta:
        model = mdlShape.Shape

        geo_field = 'location'
        fields = '__all__'
