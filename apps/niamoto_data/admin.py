# coding: utf-8

from django.contrib.gis import admin
from .models import Massif, Plot


class MassifAdmin(admin.GeoModelAdmin):
    fields = ('id', 'full_name', 'geom')
    list_display = ('id', 'key_name', 'full_name')
    readonly_fields = ('id', 'key_name', 'full_name')
    modifiable = False


class PlotAdmin(admin.GeoModelAdmin):
    fields = ('id', 'name', 'width', 'height', 'location')
    list_display = ('id', 'name', 'width', 'height', 'location')
    readonly_fields = ('id', 'name', 'width', 'height')
    modifiable = False


admin.site.register(Massif, MassifAdmin)
admin.site.register(Plot, PlotAdmin)
