# coding: utf-8

from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

from apps.niamoto_data.models import Plot
from apps.niamoto_data.serializers import PlotSerializer
import apps.plot_dashboard.analysis as a


@method_decorator(login_required, name='dispatch')
class PlotDashboardView(TemplateView):
    """
    Class-based view for plot dashboards page.
    """
    template_name = "plot_dashboard/plot_dashboard.html"
    plots_url = reverse_lazy("data-api:plot-list")


class PlotDashboardViewSet(ViewSet):
    """
    Viewset providing dashboard data for plots.
    """

    def retrieve(self, request, pk=None):
        plot = Plot.objects.get(pk=pk)
        plot_data = PlotSerializer(plot).data
        dataset = a.get_occurrences_by_plot(pk)
        families_dist, total_identified = a.get_families_distribution(
                dataset,
                limit=10,
        )
        response = {
            "plot": plot_data,
            "nb_occurrences": len(dataset),
            "nb_occurrences_identified": total_identified,
            "families_distribution": zip(
                families_dist['family_full_name'],
                families_dist['nb_occurrences']
            ),
            "species_distribution": a.get_species_distribution(
                dataset,
                limit=10,
            ),
            "dbh_classification": a.get_dbh_classification(
                dataset,
                bin_size=10,
            )
        }
        return Response(response)

    def list(self, request):
        return Response({})
