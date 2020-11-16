from django.contrib import admin

from .models import Taxon, Frequency, Graph

# admin.site.register(Graph)


@admin.register(Graph)
class GraphAdmin(admin.ModelAdmin):
    list_display = ('label', 'show', 'sort', 'title', 'model',
                    'height', 'legend_locate', 'legend_type', 'information')
    list_editable = ('show', 'sort', 'title', 'model',
                     'height', 'legend_locate', 'legend_type', 'information')


@admin.register(Taxon)
class TaxonAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'rank_name', 'parent',
                    'id_endemia', 'id_rang')
    list_editable = ('rank_name', 'parent',
                     'id_endemia', 'id_rang')
