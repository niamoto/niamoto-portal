from django.shortcuts import render
from apps.data_plot import models
from rest_framework import viewsets
from . import serializers
# Create your views here.


class PlosViewSet(viewsets.ReadOnlyModelViewSet):
    """a viewset to retrieve all the plots

    Arguments:
        viewsets {[type]} -- [description]
    """

    queryset = models.Plot.objects.all()
    serializer_class = serializers.PlotSerializer
