# coding: utf-8

from rest_framework import serializers

from apps.forest_digitizing.models import MassifAssignation


class MassifAssignationSerializer(serializers.ModelSerializer):
    """
    Serializer class for MassifAssignation model.
    """

    massif_key_name = serializers.SerializerMethodField()

    def get_massif_key_name(self, instance):
        return instance.massif.key_name

    class Meta:
        model = MassifAssignation
        fields = (
            'massif_key_name',
            'operator',
            'status',
        )
