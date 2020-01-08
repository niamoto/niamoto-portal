# Create your tests here.
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from .models import Graph, Plot, Frequency

from django.apps import apps
from apps.data_plot.apps import DataPlotConfig


class DataPlotConfigTest(TestCase):
    def test_apps(self):
        self.assertEqual(DataPlotConfig.name, 'data_plot')
        self.assertEqual(apps.get_app_config(
            'data_plot').name, 'apps.data_plot')


class PageTestCase(TestCase):

    def test_dashboard_page(self):
        response = self.client.get(reverse('plot:dashboard'))
        self.assertEqual(response.status_code, 200)


class GraphTestCase(TestCase):

    def setUp(self):
        Graph.objects.create(label='graph1', title='titre',
                             model='model', height='25', sort=1)

    def test_graph_get_name(self):
        graph1 = Graph.objects.get(label='graph1')
        self.assertEqual(str(graph1), 'graph1')


class PlotTestCase(TestCase):

    def setUp(self):
        Plot.objects.create(label='plot1')

    def test_plot_get_name(self):
        plot1 = Plot.objects.get(label='plot1')
        self.assertEqual(str(plot1), 'plot1')


class FrequencyTestCase(TestCase):

    def setUp(self):
        Plot.objects.create(label='plot1')
        plot1 = Plot.objects.get(label='plot1')
        Frequency.objects.create(plot=plot1, class_object='frequency1',
                                 class_name='100', class_value=50.0)

    def test_frequency_get_name(self):
        frequency1 = Frequency.objects.get(class_object='frequency1')
        self.assertEqual(str(frequency1), 'plot1 100')
