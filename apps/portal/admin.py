from django.contrib import admin

from .models import Ressource, Person, Activity, Faq


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('contrat', 'title', 'support',
                    'link')
    list_editable = ('title', 'support', 'link')


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name',
                    'permanent', 'function', 'speciality')
    list_editable = ('permanent', 'function', 'speciality')


@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('support', 'description')

@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ('id','question', 'ask')
    list_editable = ('question', 'ask')