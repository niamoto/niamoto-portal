# coding: utf-8

import json
from datetime import datetime

from django.http import HttpResponseForbidden
from django.shortcuts import render, redirect
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.core.urlresolvers import reverse, reverse_lazy
from django.contrib.gis.geos.point import Point
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework import permissions

from apps.niamoto_data.serializers import TaxonSerializer
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
    title = "Nouvel Inventaire taxonomique"

    def form_valid(self, form):
        location = self.get_location(form)
        taxa = self.get_taxa(form)
        if location is None or taxa is None:
            return self.form_invalid(form)
        d = datetime.strptime(form.data['inventory_date'], '%d/%M/%Y').date()
        TaxaInventory.objects.create_taxa_inventory(
            inventory_date=d,
            observer=self.request.user,
            location=location,
            location_description=form.data['location_description'],
            taxa=taxa
        )
        return redirect(reverse('taxa_inventory_index'))

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
        kwargs['title'] = self.title
        if 'add' not in kwargs:
            kwargs['add'] = True
        kwargs['taxa_url'] = reverse("data-api:taxon-list")
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
        if len(taxa) == 0:
            return None
        return taxa

    def is_taxa_valid(self, form):
        return self.get_taxa(form) is not None


@method_decorator(login_required, name='dispatch')
class TaxaInventoryUpdateView(TaxaInventoryFormView, UpdateView):
    """
    Class based view for updating an existing taxa inventory.
    """
    form_class = TaxaInventoryForm
    title = "Consultation/Modification de l'inventaire taxonomique"

    def get_queryset(self):
        return TaxaInventory.objects

    def form_valid(self, form):
        location = self.get_location(form)
        taxa = self.get_taxa(form)
        if location is None or taxa is None:
            return self.form_invalid(form)
        d = datetime.strptime(form.data['inventory_date'], '%d/%M/%Y').date()
        self.object.inventory_date = d
        self.object.location = location
        self.object.description = form.data['location_description']
        self.object.update_occurrences(taxa)
        return redirect(reverse('taxa_inventory_index'))

    def get_context_data(self, **kwargs):
        long = self.object.location.x
        lat = self.object.location.y
        kwargs['long'] = str(long)
        kwargs['lat'] = str(lat)
        occurrences = self.object.occurrences.all()
        taxa = [o.taxon for o in occurrences]
        serializer = TaxonSerializer(taxa, many=True)
        kwargs['taxa'] = json.dumps(serializer.data)
        kwargs['read_only'] = self.is_read_only()
        kwargs['edit'] = True
        kwargs['add'] = False
        return super(TaxaInventoryUpdateView, self).get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        if request.user != self.get_object().observer:
            return HttpResponseForbidden()
        return super(TaxaInventoryUpdateView, self).post(
            request,
            *args,
            **kwargs
        )

    def get_form_kwargs(self):
        kwargs = super(TaxaInventoryUpdateView, self).get_form_kwargs()
        if self.is_read_only():
            kwargs['read_only'] = True
        return kwargs

    def is_read_only(self):
        return self.object.observer != self.request.user


class TaxaInventoryDeleteView(DeleteView):
    model = TaxaInventory
    template_name = "inventories/confirm_taxa_inventory_delete.html"
    success_url = reverse_lazy('taxa_inventory_index')

    def dispatch(self, request, *args, **kwargs):
        if request.user != self.get_object().observer:
            return HttpResponseForbidden()
        return super(TaxaInventoryDeleteView, self).dispatch(
            request,
            *args,
            **kwargs
        )


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
