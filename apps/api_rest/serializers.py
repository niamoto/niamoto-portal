from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from rest_framework_recursive.fields import RecursiveField
from apps.data_plot import models as mdlPlot
from apps.data_shape import models as mdlShape
from apps.data_taxon import models as mdlTaxon


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


class taxonFrequencySerializer(serializers.ModelSerializer):
    """to output frequency properties

    Arguments:
        serializers {[type]} -- [description]
    """
    class Meta:
        model = mdlTaxon.Frequency

        fields = '__all__'


class taxonsSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    # children = serializers.ListSerializer(child=RecursiveField()
                                        #   )

    class Meta:
        model=mdlTaxon.Taxon

        fields=('id', 'rank_name', 'parent_id')

class taxonsTreeSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    children = serializers.ListSerializer(child=RecursiveField())


    class Meta:
        model=mdlTaxon.Taxon

        fields=('id', 'rank_name', 'children')


class taxonSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output taxon properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies=taxonFrequencySerializer(many = True, read_only = True)

    class Meta:
        model=mdlTaxon.Taxon

        fields='__all__'
