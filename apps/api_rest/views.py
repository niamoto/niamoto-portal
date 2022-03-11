from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from apps.data_plot import models as mdlPlot
from apps.data_shape import models as mdlShape
from apps.data_taxon import models as mdlTaxon
from rest_framework import viewsets
from rest_framework.response import Response
from . import serializers
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import transform
import pyproj
from functools import partial
import json
import geojson
from math import pi
from django.contrib.gis.geos import GEOSGeometry
from django.db.models.functions import Lower

# Create your views here.


class PlotsViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the plots

    Arguments:
        viewsets {[type]} -- [description]
    """
    base_name = 'plot'

    @method_decorator(cache_page(60*60*24*300))
    def list(self, request):
        queryset = mdlPlot.Plot.objects.all().order_by(Lower('label').asc())
        serializer = serializers.PlotsSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        plot_queryset = mdlPlot.Plot.objects.all()
        plot = get_object_or_404(plot_queryset, pk=pk)
        plot_data = serializers.PlotSerializer(plot).data

        return Response(plot_data)


class ShapesViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the shapes

    Arguments:
        viewsets {[type]} -- [description]

    Todo handle shape multipolygon having a polygon for topology simplify
    """
    base_name = 'shape'

    @method_decorator(cache_page(60*60*24*300))
    def list(self, request):
        queryset = mdlShape.Shape.objects.all()
        serializer = serializers.ShapesSerializer(queryset, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(60*60*24*300))
    def retrieve(self, request, pk=None):
        tolerance = 0.002
        preserveTopology = True
        if (pk == '1'):
            tolerance = 0.02
        shape_queryset = mdlShape.Shape.objects.all()
        shape = get_object_or_404(shape_queryset, pk=pk)
        if shape.location.num_geom > 1:
            shape.location = shape.location.simplify(
                tolerance, preserve_topology=preserveTopology)
        if hasattr(shape.geom_forest, 'num_geom'):
            if shape.geom_forest.num_geom > 1:
                shape.geom_forest = shape.geom_forest.simplify(
                    tolerance, preserve_topology=preserveTopology)
        shape_data = serializers.ShapeSerializer(shape).data

        return Response(shape_data)


class ShapeLocationViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve tuile shape

    Arguments:
        viewsets {[type]} -- [description]

    Todo:
        make box zoom
    """
    basename = 'shapeLocation'

    @method_decorator(cache_page(60*60*24*300))
    def list(self, request):
        queryset = mdlShape.Shape.objects.all()
        serializer = serializers.ShapesSerializer(queryset, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(60*60*24*300))
    def retrieve(self, request, pk=None):
        pixel = pixel_length(100)
        shape_queryset = mdlShape.Shape.objects.all()
        shape_result = get_object_or_404(shape_queryset, pk=pk)
        shape_result.location = shape_result.location.simplify(
            0.02, preserve_topology=True)
        shape_data = serializers.ShapeLocationSerializer(shape_result).data

    # polygon = Polygon(shape_data)

        return Response(shape_data)


def pixel_length(zoom):
    RADIUS = 6378137
    CIRCUM = 2 * pi * RADIUS
    SIZE = 256
    return CIRCUM / SIZE / 2 ** int(zoom)


class taxonsViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the taxons

    Arguments:
        viewsets {[type]} -- [description]
    """
    base_name = 'taxon'


    @method_decorator(cache_page(60*60*24*300))
    def list(self, request):
        queryset = mdlTaxon.Taxon.objects.all().order_by('rank_name')
        serializer = serializers.TaxonsSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        taxon_queryset = mdlTaxon.Taxon.objects.all()
        taxon = get_object_or_404(taxon_queryset, pk=pk)
        taxon_data = serializers.TaxonSerializer(taxon).data

        return Response(taxon_data)


class taxonsTreeViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the taxons

    Arguments:
        viewsets {[type]} -- [description]
    """
    base_name = 'taxon_tree'

    @method_decorator(cache_page(60*60*24*300))
    def list(self, request):
        queryset = mdlTaxon.Taxon.objects.filter(
            id_rang=10).order_by('rank_name')
        serializer = serializers.TaxonsTreeSerializer(queryset, many=True)
        return Response(serializer.data)
