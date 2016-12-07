# coding: utf-8

from django.http import HttpResponseForbidden
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.contrib.gis.geos.point import Point
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework import permissions

from apps.inventories.forms import RapidInventoryForm,\
    GeneralInformationsForm,\
    MeasuresFromCenterForm,\
    VegetationDescriptionForm,\
    MeasuresWalkingForm
from apps.inventories.models import RapidInventory
from apps.inventories.serializers import RapidInventorySerializer
from apps.inventories.permissions import IsOwnerOrReadOnly


FIELDS = [
    'inventory_date',
    'observer_full_name',
    'location_description',
    'location',
    'consult',
]
HEADER = [
    "Date de l'inventaire",
    "Observateur",
    "Localisation (description)",
    "Localisation (longitude/latitude WGS84)",
    "",
]
RECORDS_PER_PAGE = 15


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

    def get_queryset(self):
        queryset = RapidInventory.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(observer__username=username)
        return queryset


@login_required()
def rapid_inventories_index(request):
    username = request.GET.get('username', None)
    qs = RapidInventory.objects.all()
    geojson_url = reverse('inventory-api:rapid_inventory-list')
    if username is not None:
        qs = qs.filter(observer__username=username)
        geojson_url = "{}?username={}".format(
            geojson_url,
            username
        )
    inventories_list = qs.order_by('-inventory_date')\
        .select_related('observer')
    paginator = Paginator(inventories_list, RECORDS_PER_PAGE)
    page_nb = request.GET.get('page', 1)
    try:
        inventories = paginator.page(page_nb)
    except PageNotAnInteger:
        inventories = paginator.page(1)
    except EmptyPage:
        inventories = paginator.page(paginator.num_pages)

    def get_val(inv, f):
        if f == 'location':
            return getattr(inv, f).x, getattr(inv, f).y
        elif f == 'consult':
            return '<a href="{}/">consulter</a>'.format(inv.id)
        elif f == 'inventory_date':
            return getattr(inv, f).strftime("%d/%m/%Y")
        return getattr(inv, f)

    data = [[get_val(inv, f) for f in FIELDS] for inv in inventories]
    return render(request, 'inventories/inventories_index.html', {
        'title': "Inventaires rapides des forêts",
        'page': paginator.page(page_nb),
        'paginator': paginator,
        'inventories': data,
        'header': HEADER,
        'geojson_url': geojson_url,
        'username': username,
    })


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
        if request.user != inventory.observer:
            return HttpResponseForbidden("Opération non authorisée")
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
    if request.user != inventory.observer:
        return HttpResponseForbidden("Opération non authorisée")
    inventory.delete()
    return redirect(reverse('rapid_inventory_index'))
