# coding: utf-8

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def api_root(request):
    response_json = {
        'docs': reverse("docs:drfdocs"),
        'data-api': reverse('data-api:api-root'),
        'taxon_dashboard-api': reverse('taxon_dashboard-api:api-root'),
        'plantnote-api': reverse('plantnote-api:api-root'),
        'forest_digitizing-api': reverse('forest_digitizing-api:api-root'),
        'inventory-api': reverse('inventory-api:api-root'),
    }
    if request.user.is_staff:
        response_json['management-api'] = reverse('management-api:api-root')
    return Response(response_json)


@api_view(['GET'])
def whoami(request):
    if request.user is None:
        return "A user is no one"
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'full_name': request.user.get_full_name(),
        'email': request.user.email,
    })
