# coding: utf-8

from django.contrib.gis import admin
from apps.forest_digitizing.models import MassifAssignation, DigitizingProblem


class MassifAssignationAdmin(admin.ModelAdmin):
    fields = ('massif', 'operator', 'status', 'spatialite_file')
    list_display = ('massif_name', 'operator', 'status', 'spatialite_file')


class DigitizingProblemAdmin(admin.ModelAdmin):
    list_display = ('massif', 'created', 'created_by', 'problem', 'comments')


admin.site.register(MassifAssignation, MassifAssignationAdmin)
admin.site.register(DigitizingProblem, DigitizingProblemAdmin)
