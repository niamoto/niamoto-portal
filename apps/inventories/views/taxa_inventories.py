# coding: utf-8

import json

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
from django.core.urlresolvers import reverse
from django.contrib.gis.geos.point import Point
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework import permissions

from apps.inventories.forms import TaxaInventoryForm
from apps.inventories.models import TaxaInventory
from apps.inventories.serializers import TaxaInventorySerializer
from apps.inventories.permissions import IsOwnerOrReadOnly


@login_required()
def taxa_inventories_index(request):
    fields = [
        'inventory_date',
        'observer_full_name',
        'location_description',
        'location',
        'consult',
    ]
    header = [
        "Date de l'inventaire",
        "Observateur",
        "Localisation (description)",
        "Localisation (longitude/latitude WGS84)",
        "",
    ]
    inventories = TaxaInventory.objects.order_by('-inventory_date')\
        .select_related('observer')

    def get_val(inv, f):
        if f == 'location':
            return getattr(inv, f).x, getattr(inv, f).y
        elif f == 'consult':
            return '<a href="{}">consulter</a>'.format(inv.id)
        elif f == 'inventory_date':
            return getattr(inv, f).strftime("%d/%m/%Y")
        return getattr(inv, f)

    data = [[get_val(inv, f) for f in fields] for inv in inventories]
    return render(request, 'inventories/inventories_index.html', {
        'title': "Inventaires taxonomiques",
        'inventories': data,
        'header': header,
        'geojson_url': reverse('inventory-api:taxa_inventory-list')
    })


@method_decorator(login_required, name='dispatch')
class TaxaInventoryFormView(FormView):
    template_name = "inventories/taxa_inventory.html"
    form_class = TaxaInventoryForm

    def form_valid(self, form):
        location = self.get_location(form)
        taxa = self.get_taxa(form)
        if location is None or taxa is None:
            return self.form_invalid(form)
        return redirect(reverse('taxa_inventory'))

    def form_invalid(self, form):
        return self.render_to_response(
            self.get_context_data(
                form=form,
                error_location=not self.is_location_valid(form),
                error_taxa=not self.is_taxa_valid(form),
            )
        )

    def get_context_data(self, **kwargs):
        if 'long'not in kwargs:
            long = self.get_form().data.get('long', None)
            if long is not None:
                kwargs['long'] = long
        if 'lat' not in kwargs:
            lat = self.get_form().data.get('lat', None)
            if lat is not None:
                kwargs['lat'] = lat
        if 'taxa' not in kwargs:
            taxa = self.get_taxa(self.get_form())
            kwargs['taxa'] = json.dumps(taxa)
        return super(TaxaInventoryFormView, self).get_context_data(**kwargs)

    def get_location(self, form):
        lat = form.data.get('lat', None)
        long = form.data.get('long', None)
        if lat == '' or long == '':
            return None
        return Point(float(long), float(lat))

    def is_location_valid(self, form):
        return self.get_location(form) is not None

    def get_taxa(self, form):
        taxa = form.data.get('taxa', None)
        if taxa == '' or taxa is None:
            return None
        taxa = json.loads(taxa)
        return taxa

    def is_taxa_valid(self, form):
        return self.get_taxa(form) is not None


class TaxaInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for retrieving taxa inventories.
    """
    base_name = 'taxa_inventory'
    queryset = TaxaInventory.objects.all()
    serializer_class = TaxaInventorySerializer
    permission_classes = (
        permissions.IsAuthenticated,
        IsOwnerOrReadOnly
    )
    pagination_class = None
