# coding: utf-8

import json

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
from django.core.urlresolvers import reverse
from django.contrib.gis.geos.point import Point
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework import permissions

from apps.inventories.forms import RapidInventoryForm,\
    GeneralInformationsForm,\
    MeasuresFromCenterForm,\
    VegetationDescriptionForm,\
    MeasuresWalkingForm,\
    TaxaInventoryForm
from apps.inventories.models import RapidInventory, TaxaInventory
from apps.inventories.serializers import RapidInventorySerializer
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
        'geojson_url': reverse('inventory-api:rapid_inventory-list')
    })


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


class RapidInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for retrieving rapid inventories.
    """
    base_name = 'rapid_inventory'
    queryset = RapidInventory.objects.all()
    serializer_class = RapidInventorySerializer
    permission_classes = (
        permissions.IsAuthenticated,
        IsOwnerOrReadOnly
    )
    pagination_class = None


@login_required()
def rapid_inventories_index(request):
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
    inventories = RapidInventory.objects.order_by('-inventory_date')\
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
    return render(request, 'inventories/rapid_inventories_index.html',
                  {'inventories': data, 'header': header, })


@login_required()
def add_rapid_inventory(request):
    long = ''
    lat = ''
    error_location = False
    if request.POST:
        form = RapidInventoryForm(request.POST)
        general_form = GeneralInformationsForm(request.POST)
        center_form = MeasuresFromCenterForm(request.POST)
        vegetation_form = VegetationDescriptionForm(request.POST)
        walking_form = MeasuresWalkingForm(request.POST)
        long = request.POST['long']
        lat = request.POST['lat']
        error_location = not (len(long) > 0 and len(lat) > 0)
        is_valid = general_form.is_valid() and center_form.is_valid()\
            and vegetation_form.is_valid() and walking_form.is_valid()\
            and len(long) > 0 and len(lat) > 0
        if is_valid:
            location = Point(float(long), float(lat))
            inventory = form.save(commit=False)
            inventory.location = location
            inventory.observer = request.user
            inventory.save()
            return redirect(reverse('rapid_inventory_index'))
    else:
        form = RapidInventoryForm()
        general_form = GeneralInformationsForm()
        center_form = MeasuresFromCenterForm()
        vegetation_form = VegetationDescriptionForm()
        walking_form = MeasuresWalkingForm()
    return render(request, 'inventories/add_inventory.html', {
        'form': form,
        'general_form': general_form,
        'center_form': center_form,
        'vegetation_form': vegetation_form,
        'walking_form': walking_form,
        'long': long,
        'lat': lat,
        'error_location': error_location,
    })


@login_required()
def consult_rapid_inventory(request, inventory_id):
    inventory = RapidInventory.objects.get(id=inventory_id)
    long, lat = [str(i) for i in inventory.location.coords]
    error_location = False
    read_only = request.user != inventory.observer
    if request.POST:
        form = RapidInventoryForm(request.POST, instance=inventory)
        general_form = GeneralInformationsForm(request.POST)
        center_form = MeasuresFromCenterForm(request.POST)
        vegetation_form = VegetationDescriptionForm(request.POST)
        walking_form = MeasuresWalkingForm(request.POST)
        long = request.POST['long']
        lat = request.POST['lat']
        error_location = not (len(long) > 0 and len(lat) > 0)
        is_valid = general_form.is_valid() and center_form.is_valid()\
            and vegetation_form.is_valid() and walking_form.is_valid()\
            and len(long) > 0 and len(lat) > 0
        if is_valid:
            location = Point(float(long), float(lat))
            inventory = form.save(commit=False)
            inventory.location = location
            inventory.observer = request.user
            inventory.save()
            return redirect(reverse('rapid_inventory_index'))
    else:
        kwarg = {'instance': inventory, 'read_only': read_only}
        form = RapidInventoryForm(**kwarg)
        general_form = GeneralInformationsForm(**kwarg)
        center_form = MeasuresFromCenterForm(**kwarg)
        vegetation_form = VegetationDescriptionForm(**kwarg)
        walking_form = MeasuresWalkingForm(**kwarg)
    return render(request, 'inventories/inventory.html', {
        'form': form,
        'general_form': general_form,
        'center_form': center_form,
        'vegetation_form': vegetation_form,
        'walking_form': walking_form,
        'long': long,
        'lat': lat,
        'error_location': error_location,
        'read_only': read_only,
    })


@login_required()
def delete_rapid_inventory(request, inventory_id):
    inventory = RapidInventory.objects.get(id=inventory_id)
    inventory.delete()
    return redirect(reverse('rapid_inventory_index'))
