# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

# import apps.taxon_dashboards.analysis as a


@method_decorator(login_required, name='dispatch')
class PlotDashboardView(TemplateView):
    """
    Class-based view for plot dashboards page.
    """
    template_name = "plot_dashboard/plot_dashboard.html"
    plots_url = reverse_lazy("data-api:plot-list")
