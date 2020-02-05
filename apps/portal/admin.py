from django.contrib import admin

from .models import Ressource, Person, Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('person', 'contrat', 'title')


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    pass


@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('support', 'description')
