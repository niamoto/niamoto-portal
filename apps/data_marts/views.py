# coding: utf-8

import json

from niamoto.api.data_marts_api import get_dimension, get_dimensional_model
import pandas as pd

from django.db import connection
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view


@method_decorator(login_required, name='dispatch')
class DataMartView(TemplateView):
    """
    Class-based view for plot dashboards page.
    """
    template_name = "data_marts/data_mart.html"

    def get_context_data(self, **kwargs):
        return {
            'props': json.dumps({
                'provinces': get_province_levels(),
                'communes': get_commune_levels(),
            }),
        }


@api_view(['POST'])
def process(request):
    agg = [
        {
            "name": "occurrence_sum",
            "label": "Nombre d'occurrences observées",
            "function": "sum",
            "measure": "occurrence_count",
        },
        {
            "name": "richness",
            "label": "Nombre d'espèces observées",
            "measure": "taxon_dimension_id",
            "function": "count_distinct",
        },
    ]
    dm = get_dimensional_model(
        'taxon_observed_occurrences',
        agg,
    )
    workspace = dm.get_cubes_workspace()
    cube = workspace.cube('taxon_observed_occurrences')
    selected_entity = json.loads(
        request.POST.get('selected_entity', None)
    )
    attributes = [
        'taxon_dimension.familia',
        'taxon_dimension.genus',
        'taxon_dimension.species',
    ]
    attributes_names = []
    for i in attributes:
        attributes_names.append((i, cube.attribute(i).label))
    aggregates_names = [(i.name, i.label) for i in cube.aggregates]

    _records = pd.read_sql(
        """
        SELECT * 
        FROM public.zones_records 
        WHERE analysis_zones_id = {}
        ORDER BY "taxon_dimension.familia";
        """.format(selected_entity['value']),
        connection
    ).reset_index().to_dict(orient='index').values()

    _metrics = pd.read_sql(
        """
        SELECT *
        FROM public.zones_metrics
        WHERE analysis_zones_id = {};
        """.format(selected_entity['value']),
        connection
    )
    r = _metrics.iloc[0]
    _summary = {
        'richness': r['richness'],
        'unique_taxa_in_entity': r['unique_taxa_in_entity'],
        'occurrence_sum': r['occurrence_sum'],
    }

    return Response({
        'summary': _summary,
        'records': _records,
        'columns': attributes_names + aggregates_names,
        'area': r['area'],
    })


def get_province_levels():
    dim = get_dimension('analysis_zones')
    vals = dim.get_values()
    labels = vals[vals['type'] == 'PROVINCE'][dim.label_col]
    labels = [(str(k), v) for k, v in labels.to_dict().items()]
    return labels


def get_commune_levels():
    dim = get_dimension('analysis_zones')
    vals = dim.get_values()
    labels = vals[vals['type'] == 'COMMUNE'][dim.label_col]
    labels = [(str(k), v) for k, v in labels.to_dict().items()]
    return labels


class DimensionViewSet(ViewSet):
    """
    Base class for dimension ViewSet.
    """

    def __init__(self, dimension_name, *args, **kwargs):
        self.dimension_name = dimension_name
        self._data = None
        super(DimensionViewSet, self).__init__(*args, **kwargs)

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, value):
        self._data = value

    def retrieve(self, request, pk=None):
        if self.data is None:
            self.data = get_dimension(self.dimension_name).get_values()
        return Response(self.data[self.data.index == int(pk)].to_json())

    def list(self, request):
        if self.data is None:
            self.data = get_dimension(self.dimension_name).get_values()
        return Response(self.data.to_json())


class ProvinceDimensionViewSet(DimensionViewSet):
    """
    Province Dimension ViewSet.
    """

    def __init__(self, *args, **kwargs):
        super(ProvinceDimensionViewSet, self).__init__(
            'analysis_zones',
            *args,
            **kwargs
        )

    @DimensionViewSet.data.setter
    def data(self, value):
        self._data = value.simplify(0.01)


class CommuneDimensionViewSet(DimensionViewSet):
    """
    Commune Dimension Viewset.
    """

    def __init__(self, *args, **kwargs):
        super(CommuneDimensionViewSet, self).__init__(
            'analysis_zones',
            *args,
            **kwargs
        )

    @DimensionViewSet.data.setter
    def data(self, value):
        self._data = value.simplify(0.005)
