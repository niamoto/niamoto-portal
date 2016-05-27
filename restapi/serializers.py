# coding: utf-8

from urllib import parse

from rest_framework import serializers

from niamoto_taxa.models import Taxon
from niamoto_occurrences.models import Occurrence
from niamoto_plantnote.models import PlantnoteDatabase


class TaxonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taxon
        fields = ('id', 'full_name', 'rank_name', 'parent', 'rank')


class OccurrenceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Occurrence
        fields = ('id', 'date', 'taxon', 'location')


class PlantnoteDatabaseSerializer(serializers.ModelSerializer):

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
