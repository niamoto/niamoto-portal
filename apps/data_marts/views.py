# coding: utf-8

import json

from niamoto.api.data_marts_api import get_dimension, get_dimensional_model
from niamoto.vector.vector_manager import VectorManager
from cubes import PointCut, Cell, SetCut
import geopandas as gpd

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
                'rainfall_filters': get_rainfall_filters(),
            }),
        }


@api_view(['GET'])
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
            "label": "Nombre de taxons observés",
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
    browser = workspace.browser(cube)
    selected_entity = json.loads(
        request.query_params.get('selected_entity', None)
    )
    if selected_entity['type'] == 'draw':
        cuts = get_occurrence_location_cuts(selected_entity)
        area = 0
    else:
        cuts = [
            PointCut(selected_entity['type'], [selected_entity['value']]),
        ]
        dim = get_dimension(selected_entity['type'])
        area = dim.get_value(selected_entity['value'], ["area"])[0]
    # Update cuts with rainfall filter
    rainfall_filter = request.query_params.get('rainfall_filter', None)
    if rainfall_filter is not None and rainfall_filter != '':
        cuts += [
            PointCut('rainfall', [rainfall_filter])
        ]
    cell = Cell(cube, cuts)
    result = browser.aggregate(
        cell,
        drilldown=[
            'rainfall:category',
            'elevation:category',
        ],
    )
    result_rainfall = browser.aggregate(
        cell,
        drilldown=['rainfall:category'],
    )
    rainfall_total = {i['rainfall.category']: i for i in result_rainfall}
    result_elevation = browser.aggregate(
        cell,
        drilldown=['elevation:category'],
    )
    elevation_total = {i['elevation.category']: i for i in result_elevation}
    attributes = [
        'rainfall.category',
        'elevation.category',
    ]
    attributes_names = []
    for i in attributes:
        attributes_names.append((i, cube.attribute(i).label))
    aggregates_names = [(i.name, i.label) for i in result.aggregates]
    return Response({
        'summary': result.summary,
        'richness': result.summary['richness'],
        'records': list(result),
        'columns': attributes_names + aggregates_names,
        'area': area,
        'totals': {
            'rainfall.category': rainfall_total,
            'elevation.category': elevation_total,
        }
    })


def get_province_levels():
    province_dim = get_dimension('provinces')
    labels = province_dim.get_labels()
    labels = [(str(k), v) for k, v in labels.to_dict().items()]
    return labels


def get_commune_levels():
    commune_dim = get_dimension('communes')
    labels = commune_dim.get_labels()
    labels = [(str(k), v) for k, v in labels.to_dict().items()]
    return labels


def get_rainfall_filters():
    dim = get_dimension('rainfall')
    return dim.cuts[1]


def get_occurrence_location_cuts(selected_entity):
    wkt = selected_entity['value']
    dim = get_dimension('occurrence_location')
    df = dim.get_values(wkt_filter=wkt)
    idx = list(df.index.values)
    if len(idx) > 0:
        cuts = [
            SetCut(
                'occurrence_location',
                [[int(i)] for i in idx],
                hierarchy='default',
            )
        ]
    else:
        cuts = [
            PointCut('occurrence_location', [-1])
        ]
    return cuts


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
            'provinces',
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
            'communes',
            *args,
            **kwargs
        )

    @DimensionViewSet.data.setter
    def data(self, value):
        self._data = value.simplify(0.005)


class RainfallVectorClassesViewSet(ViewSet):
    """
    Viewset for retrieving rainfall vector classes.
    """

    def list(self, request):
        geojson = request.query_params.get('geojson')
        df = VectorManager.get_vector_geo_dataframe(
            'rainfall_classes',
            geojson_filter=geojson,
            geojson_cut=True,
        )
        return Response({
            'geojson': df.to_json()
        })


class ElevationVectorClassesViewSet(ViewSet):
    """
    Viewset for retrieving elevation vector classes.
    """

    def list(self, request):
        geojson = request.query_params.get('geojson')
        df = VectorManager.get_vector_geo_dataframe(
            'elevation_classes',
            geojson_filter=geojson,
            geojson_cut=True,
        )
        return Response({
            'geojson': df.to_json()
        })
