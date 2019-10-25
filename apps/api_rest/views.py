from django.shortcuts import get_object_or_404
from apps.data_plot import models
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
        queryset = models.Plot.objects.all()
        serializer = serializers.PlotsSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        plot_queryset = models.Plot.objects.all()
        plot = get_object_or_404(plot_queryset, pk=pk)
        plot_data = serializers.PlotSerializer(plot).data

        return Response(plot_data)
