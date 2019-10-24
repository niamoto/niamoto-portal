from rest_framework import serializers
from apps.data_plot import models


class PlotSerializer(serializers.ModelSerializer):
    """to output all the plots

    Arguments:
        serializers {[type]} -- [description]
    """

    class Meta:
        model = models.Plot

        fields = ('id', 'label', 'count_families', 'count_species')
