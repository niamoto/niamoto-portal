# coding: utf-8

import json

from niamoto.api.data_marts_api import get_dimension, get_dimensional_model
from niamoto.vector.vector_manager import VectorManager
from cubes import PointCut, Cell, SetCut
import pandas as pd

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
                'elevation_filters': get_elevation_filters(),
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
        request.POST.get('selected_entity', None)
    )
    cuts = []
    invert_location_cuts = []
    invert_env_cuts = []
    invert_env = False
    if selected_entity['type'] == 'draw':
        location_cuts = get_occurrence_location_cuts(selected_entity)
        cuts += location_cuts
        invert_env_cuts += location_cuts
        invert_location_cuts += get_occurrence_location_cuts(
            selected_entity,
            invert=True
        )
        area = 0
    else:
        entity_cut = PointCut(
            selected_entity['type'],
            [selected_entity['value']]
        )
        cuts += [entity_cut]
        invert_env_cuts += [entity_cut]
        invert_location_cuts += [
            PointCut(
                selected_entity['type'],
                [selected_entity['value']],
                invert=True
            ),
        ]
        dim = get_dimension(selected_entity['type'])
        area = dim.get_value(selected_entity['value'], ["area"])[0]
    # Update cuts with rainfall filter
    rainfall_filter = request.POST.get('rainfall_filter', None)
    if rainfall_filter is not None and rainfall_filter != '':
        cuts += [
            PointCut('rainfall', [rainfall_filter])
        ]
        invert_env_cuts += [
            PointCut('rainfall', [rainfall_filter], invert=True)
        ]
        invert_env = True
    # Update cuts with elevation filter
    elevation_filter = request.POST.get('elevation_filter', None)
    if elevation_filter is not None and elevation_filter != '':
        cuts += [
            PointCut('elevation', [elevation_filter])
        ]
        invert_env_cuts += [
            PointCut('elevation', [elevation_filter], invert=True)
        ]
        invert_env = True
    df = pd.DataFrame(list(browser.facts(cell=Cell(cube, cuts))))
    summary = {'occurrence_sum': 0, 'richness': 0}
    records, rainfall_total, elevation_total = [], {}, {}
    taxa_ids = pd.Index([])
    if len(df) > 0:
        # Init summary with occurrence_sum
        summary['occurrence_sum'] = df['occurrence_count'].sum()
        # Init records with occurrence sum
        records = pd.DataFrame(
            df.groupby(
                ['rainfall.category', 'elevation.category']
            )['occurrence_count'].sum(),
            columns=['occurrence_count']
        ).rename(
            columns={'occurrence_count': 'occurrence_sum'},
        )
        records['richness'] = 0
        # Filter occurrences identified at species level for richness
        df_species = df[df['taxon_dimension.species'] != 'NS']
        if len(df_species) > 0:
            taxa_ids = pd.Index(df_species['taxon_dimension_id'].unique())
            # Update summary with richness
            summary['richness'] = df_species['taxon_dimension_id'].nunique()
            # Compute rainfall total
            rainfall_total = pd.DataFrame(
                df_species.groupby(
                    ['rainfall.category']
                )['taxon_dimension_id'].nunique(),
                columns=['taxon_dimension_id']
            ).rename(
                columns={'taxon_dimension_id': 'richness'},
            ).reset_index().to_dict(orient='index').values()
            rainfall_total = {
                i['rainfall.category']: i for i in rainfall_total
            }
            # Compute elevation total
            elevation_total = pd.DataFrame(
                df_species.groupby(
                    ['elevation.category']
                )['taxon_dimension_id'].nunique(),
                columns=['taxon_dimension_id']
            ).rename(
                columns={'taxon_dimension_id': 'richness'}
            ).reset_index().to_dict(orient='index').values()
            elevation_total = {
                i['elevation.category']: i for i in elevation_total
            }
            # Update records with richness
            records['richness'] = df_species.groupby(
                ['rainfall.category', 'elevation.category']
            )['taxon_dimension_id'].nunique()
            records = records.reset_index().to_dict(orient='index').values()
    # Compute unique taxa in selected location indicator
    invert_loc_cell = Cell(cube, invert_location_cuts)
    invert_loc_df = pd.DataFrame(list(browser.facts(cell=invert_loc_cell)))
    invert_loc_taxa_ids = pd.Index([])
    if len(invert_loc_df) > 0:
        invert_loc_taxa_ids = pd.Index(
            invert_loc_df['taxon_dimension_id'].unique()
        )
    diff = taxa_ids.difference(invert_loc_taxa_ids)
    if invert_env > 0:
        invert_env_cell = Cell(cube, invert_env_cuts)
        list(browser.facts(cell=invert_env_cell))
        invert_env_df = pd.DataFrame(list(browser.facts(cell=invert_env_cell)))
        if len(invert_env_df) > 0:
            invert_env_taxa_ids = pd.Index(
                invert_env_df['taxon_dimension_id'].unique()
            )
            diff = diff.difference(invert_env_taxa_ids)
    summary['unique_taxa_in_entity'] = len(diff)
    # Extract table attributes
    attributes = [
        'rainfall.category',
        'elevation.category',
    ]
    attributes_names = []
    for i in attributes:
        attributes_names.append((i, cube.attribute(i).label))
    aggregates_names = [(i.name, i.label) for i in cube.aggregates]
    return Response({
        'summary': summary,
        'records': records,
        'columns': attributes_names + aggregates_names,
        'area': area,
        'totals': {
            'rainfall.category': rainfall_total,
            'elevation.category': elevation_total,
        },
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


def get_elevation_filters():
    dim = get_dimension('elevation')
    return dim.cuts[1]


def get_occurrence_location_cuts(selected_entity, invert=False):
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
                invert=invert
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


@api_view(['POST'])
def get_rainfall_vector_classes(request):
    """
    Retrieve rainfall vector classes.
    """
    geojson = request.POST.get('geojson')
    df = VectorManager.get_vector_geo_dataframe(
        'rainfall_classes',
        geojson_filter=geojson,
        geojson_cut=True,
    )
    return Response({
        'geojson': df.to_json()
    })


@api_view(['POST'])
def get_elevation_vector_classes(request):
    """
    Retrieve elevation vector classes.
    """
    geojson = request.POST.get('geojson')
    df = VectorManager.get_vector_geo_dataframe(
        'elevation_classes',
        geojson_filter=geojson,
        geojson_cut=True,
    )
    return Response({
        'geojson': df.to_json()
    })
