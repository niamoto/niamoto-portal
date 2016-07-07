# coding: utf-8

from django.contrib.gis import admin
from .models import Massif


class MassifAdmin(admin.GeoModelAdmin):
    fields = ('id', 'full_name', 'geom')
    list_display = ('id', 'key_name', 'full_name')
    readonly_fields = ('id', 'key_name', 'full_name')
    modifiable = False


admin.site.register(Massif, MassifAdmin)
