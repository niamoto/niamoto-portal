from rest_framework import serializers
from rest_framework import filters
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
                  'h_mean', 'wood_density_mean', 'biomass', 'count_species',
                  'species_level', 'location')


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

        fields = ('class_object', 'class_name', 'class_value', 'shape_id')


class ShapesSerializer(serializers.ModelSerializer):
    """to output all the shapes

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = mdlShape.Shape

        fields = ('id', 'type_shape', 'label')


class ShapeSerializer(gis_serializers.GeoFeatureModelSerializer):
    """to output shape properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = ShapeFrequencySerializer(many=True, read_only=True)

    class Meta:
        model = mdlShape.Shape

        geo_field = 'location'
        fields = ('label', 'location', 'elevation', 'land_area', 'land_um_area',
                  'forest_area', 'forest_um_area', 'forest_perimeter', 'nb_patchs',
                  'forest_in', 'nb_occurence',
                  'nb_families', 'nb_species', 'fragment_meff_cbc', 'geom_forest',
                  'rainfall_min', 'rainfall_max', 'elevation_median', 'elevation_max',
                  'frequencies')


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


class TaxonsSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    # children = serializers.ListSerializer(child=RecursiveField()
    #   )

    class Meta:
        model = mdlTaxon.Taxon

        fields = ('id', 'rank_name', 'parent_id')


class TaxonsTreeSerializer(serializers.ModelSerializer):
    """to output all the taxons

    Arguments:
        serializers {[type]} -- [description]
    """

    children = serializers.ListSerializer(child=RecursiveField())

    class Meta:
        model = mdlTaxon.Taxon

        fields = ('id', 'rank_name', 'children')


class TaxonSerializer(serializers.ModelSerializer):
    """to output taxon properties

    Arguments:
        serializers {[type]} -- [description]
    """
    frequencies = taxonFrequencySerializer(many=True, read_only=True)

    class Meta:
        model = mdlTaxon.Taxon
        filter_backends = [filters.OrderingFilter]
        ordering_fields = '__all__'
        ordering = ['class_object', 'class_index']
        fields = '__all__'
