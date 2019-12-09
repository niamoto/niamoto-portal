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


class PlotsSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output all the plots

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlPlot.Plot

        geo_field = 'location'
        fields = ('id', 'label', 'shannon', 'pielou', 'simpson', 'basal_area',
                  'h_mean', 'wood_density', 'biomasse', 'count_species',
                  'species_level','location')


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

        fields = ('id','type_shape', 'label')


class ShapeSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output shape properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = ShapeFrequencySerializer(many=True, read_only=True)

    class Meta:
        model = mdlShape.Shape

        geo_field = 'location'
        fields = ('label', 'location', 'elevation', 'land_area', 'um_area', 
            'forest_area', 'forest_um_area', 'forest_perimeter', 'nb_patchs',
            'nb_patchs_in', 'forest_in', 'r_in_median', 'nb_occurence',
            'nb_families', 'nb_species', 'n_unique_species', 'frequencies')

class ShapeLocationSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output shape location

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlShape.Shape

        geo_field = 'location'
        fields = ('label', 'location')


class taxonFrequencySerializer(serializers.ModelSerializer):
    """to output frequency properties

    Arguments:
        serializers {[type]} -- [description]
    """
    class Meta:
        model = mdlTaxon.Frequency

        fields = '__all__'


class taxonPhenology(serializers.ModelSerializer):
    """to output phenology
    
    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlTaxon.Phenology

        fields = '__all__'

class taxonsSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    # children = serializers.ListSerializer(child=RecursiveField()
                                        #   )

    class Meta:
        model = mdlTaxon.Taxon

        fields = ('id', 'rank_name', 'parent_id')


class taxonsTreeSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    children = serializers.ListSerializer(child=RecursiveField())

    class Meta:
        model = mdlTaxon.Taxon

        fields = ('id', 'rank_name', 'children')


class taxonSerializer(serializers.ModelSerializer):
    """to output taxon properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = taxonFrequencySerializer(many = True, read_only = True)
    phenology = taxonPhenology(many = True, read_only = True)

    class Meta:
        model = mdlTaxon.Taxon

        fields = '__all__'

