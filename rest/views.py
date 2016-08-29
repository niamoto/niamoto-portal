# coding: utf-8

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'docs': reverse("docs:drfdocs"),
        'data-api': reverse('data-api:api-root'),
        'occurrence-api': reverse('data-api:api-root'),
        'plantnote-api': reverse('plantnote-api:api-root'),
        'forest_digitizing-api': reverse('forest_digitizing-api:api-root'),
        'rapid_inventory-api': reverse('inventory-api:api-root'),
        'management-api': reverse('management-api:api-root'),
    })

