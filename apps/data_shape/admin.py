from django.contrib import admin

from .models import Shape, Frequency, Graph

# admin.site.register(Graph)


@admin.register(Graph)
class GraphAdmin(admin.ModelAdmin):
    list_display = ('label', 'show', 'sort', 'title', 'model', 'height')
    list_editable = ('show', 'sort', 'title', 'model', 'height')
