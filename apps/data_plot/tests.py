# Create your tests here.
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from .models import Graph


class PageTestCase(TestCase):

    def test_dashboard_page(self):
        response = self.client.get(reverse('plot:dashboard'))
        self.assertEqual(response.status_code, 200)


class GraphTestCase(TestCase):

    def setUp(self):
        Graph.objects.create(label='graph1', title='titre',
                             model='model', height='md', sort=1)

    def test_graph_get_name(self):
        graph1 = Graph.objects.get(label='graph1')
        self.assertEqual(str(graph1), 'graph1')
