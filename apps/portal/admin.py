from django.contrib import admin

from .models import Ressource, Person, Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('person', 'contrat', 'title', 'support',
                    'link')
    list_editable = ('title', 'support', 'link')


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'permanent', 'function', 'image')
    list_editable = ('permanent', 'function')


@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('support', 'description')
