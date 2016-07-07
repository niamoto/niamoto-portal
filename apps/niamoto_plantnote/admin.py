# coding: utf-8

from django.contrib import admin

from .models import PlantnoteDatabase


class PlantnoteDatabaseAdmin(admin.ModelAdmin):
    readonly_fields = (
        'uuid',
        'created_at',
        'updated_at',
        'last_activated_at',
    )
    list_display = (
        'uuid',
        'created_at',
        'updated_at',
        'last_activated_at',
        'active',
    )


admin.site.register(PlantnoteDatabase, PlantnoteDatabaseAdmin)
