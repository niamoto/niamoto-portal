# coding: utf-8

from urllib import parse

from rest_framework import serializers

from apps.niamoto_plantnote.models import PlantnoteDatabase


class PlantnoteDatabaseSerializer(serializers.ModelSerializer):
    """
    Serializer class for PlantnoteDatabase model, from niamoto-plantnote app.
    """

    file_url = serializers.SerializerMethodField()

    def get_file_url(self, instance):
        return parse.urljoin(
            'http://{}'.format(self.context['request'].get_host()),
            instance.file.url
        )

    class Meta:
        model = PlantnoteDatabase
        fields = (
            'uuid',
            'created_at',
            'updated_at',
            'active',
            'last_activated_at',
            'file_url',
        )
