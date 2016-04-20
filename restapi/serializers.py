# coding: utf-8

from rest_framework import serializers, viewsets

from taxo.models import Taxon


class TaxonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taxon
        fields = ('id', 'full_name', 'rank_name', 'parent', 'rank')


# ViewSets define the view behavior.
class TaxonViewSet(viewsets.ModelViewSet):
    queryset = Taxon.objects.all()
    serializer_class = TaxonSerializer
