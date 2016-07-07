# coding: utf-8

from rest_framework_gis import serializers as gis_serializers
from rest_framework import serializers

from apps.rapid_inventories.models import RapidInventory


class RapidInventorySerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for RapidInventory model.
    """

    observer_full_name = serializers.SerializerMethodField('get_observer_name')

    def get_observer_name(self, rapid_inventory):
        return rapid_inventory.observer_full_name

    class Meta:
        model = RapidInventory
        geo_field = 'location'
