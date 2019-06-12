# coding: utf-8

from rest_framework_gis import serializers as gis_serializers
from rest_framework import serializers

from apps.inventories.models import RapidInventory, TaxaInventory


class RapidInventorySerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for RapidInventory model.
    """

    observer_full_name = serializers.SerializerMethodField('get_observer_name')
    id = serializers.SerializerMethodField()

    def get_observer_name(self, rapid_inventory):
        return rapid_inventory.observer_full_name

    def get_id(self, rapid_inventory):
        return rapid_inventory.id

    class Meta:
        model = RapidInventory
        geo_field = 'location'
        fields = (
            'id',
            'observer_full_name',
            'created_at',
            'inventory_date',
            'location_description',
        )


class TaxaInventorySerializer(gis_serializers.GeoFeatureModelSerializer):
    """
    Serializer class for TaxaInventory model.
    """

    observer_full_name = serializers.SerializerMethodField('get_observer_name')
    id = serializers.SerializerMethodField()

    def get_observer_name(self, taxa_inventory):
        return taxa_inventory.observer_full_name

    def get_id(self, taxa_inventory):
        return taxa_inventory.id

    class Meta:
        model = TaxaInventory
        geo_field = 'location'
        fields = (
            'id',
            'observer_full_name',
            'created_at',
            'inventory_date',
            'location_description',
        )
