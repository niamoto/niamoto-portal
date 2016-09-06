# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required, name='dispatch')
class TaxonTreeView(TemplateView):
    """
    Class-based view for taxon dashboards, where taxa are selected using
    a tree view.
    """
    template_name = "taxon_dashboards/taxon_treeview.html"
    taxa_tree_url = reverse_lazy("data-api:taxon-list")
