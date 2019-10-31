from django.shortcuts import get_object_or_404
from apps.data_plot import models as mdlPlot
from apps.data_shape import models as mdlShape
from rest_framework import viewsets
from rest_framework.response import Response
from . import serializers
# Create your views here.


class PlotsViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the plots

    Arguments:
        viewsets {[type]} -- [description]
    """
    base_name = 'plot'

    def list(self, request):
        queryset = mdlPlot.Plot.objects.all()
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
    """
    base_name = 'shape'

    def list(self, request):
        queryset = mdlShape.Shape.objects.all()
        serializer = serializers.ShapesSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        shape_queryset = mdlShape.Shape.objects.all()
        shape = get_object_or_404(shape_queryset, pk=pk)
        shape_data = serializers.ShapeSerializer(shape).data

        return Response(shape_data)
