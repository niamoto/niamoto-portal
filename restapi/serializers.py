# coding: utf-8

from rest_framework import serializers

from ncbif_taxa.models import Taxon
from ncbif_occurrences.models import Occurrence


class TaxonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taxon
        fields = ('id', 'full_name', 'rank_name', 'parent', 'rank')


class OccurrenceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Occurrence
        fields = ('id', 'date', 'taxon', 'location')
