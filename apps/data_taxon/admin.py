from django.contrib import admin

from .models import Taxon, Frequency, Graph

# admin.site.register(Graph)


@admin.register(Graph)
class GraphAdmin(admin.ModelAdmin):
    list_display = ('label', 'show', 'sort', 'title', 'model',
                    'height', 'legend_locate', 'legend_type')
    list_editable = ('show', 'sort', 'title', 'model',
                     'height', 'legend_locate', 'legend_type')


@admin.register(Taxon)
class TaxonAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'rank_name', 'parent',
                    'id_endemia', 'id_rang', 'occ_count', 'plot_count')
    list_editable = ('rank_name', 'parent',
                     'id_endemia', 'id_rang', 'occ_count', 'plot_count')
