# coding: utf-8

from django.contrib import admin

from apps.inventories.models import RapidInventory


class RapidInventoryAdmin(admin.ModelAdmin):
    pass


admin.site.register(RapidInventory, RapidInventoryAdmin)