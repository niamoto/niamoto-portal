# coding: utf-8

from rest_framework_gis import serializers as gis_serializers

from rapid_inventories.models import RapidInventory


class RapidInventorySerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for RapidInventory model.
    """
    class Meta:
        model = RapidInventory
        geo_field = 'location'
        fields = (
            'id',
            'inventory_date',
            'location_description',
            'observer_full_name'
        )
