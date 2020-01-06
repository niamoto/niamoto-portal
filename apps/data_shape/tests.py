# Create your tests here.
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from .models import Graph, Shape, Frequency


class PageTestCase(TestCase):

    def test_dashboard_page(self):
        response = self.client.get(reverse('shape:dashboard'))
        self.assertEqual(response.status_code, 200)


class GraphTestCase(TestCase):

    def setUp(self):
        Graph.objects.create(label='graph1', title='titre',
                             model='model', height='md', sort=1)

    def test_graph_get_name(self):
        graph1 = Graph.objects.get(label='graph1')
        self.assertEqual(str(graph1), 'graph1')


class ShapeTestCase(TestCase):

    def setUp(self):
        Shape.objects.create(label='shape1')

    def test_shape_get_name(self):
        shape1 = Shape.objects.get(label='shape1')
        self.assertEqual(str(shape1), 'shape1')


class FrequencyTestCase(TestCase):

    def setUp(self):
        Shape.objects.create(label='shape1')
        shape1 = Shape.objects.get(label='shape1')
        Frequency.objects.create(shape=shape1, class_object='frequency1',
                                 class_name='100', class_value=50.0)

    def test_frequency_get_name(self):
        frequency1 = Frequency.objects.get(class_object='frequency1')
        self.assertEqual(str(frequency1), 'shape1 100')
