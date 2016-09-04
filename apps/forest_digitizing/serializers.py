# coding: utf-8

from rest_framework import serializers

from apps.forest_digitizing.models import MassifAssignation


class MassifAssignationSerializer(serializers.ModelSerializer):
    """
    Serializer class for MassifAssignation model.
    """

    massif_key_name = serializers.SerializerMethodField()
    massif_id = serializers.SerializerMethodField()
    operator_full_name = serializers.SerializerMethodField()

    def get_massif_key_name(self, instance):
        return instance.massif.key_name

    def get_massif_id(self, instance):
        return instance.massif.id

    def get_operator_full_name(self, instance):
        return instance.operator.get_full_name()

    class Meta:
        model = MassifAssignation
        fields = (
            'massif_id',
            'massif_key_name',
            'operator',
            'operator_full_name',
            'status',
        )
