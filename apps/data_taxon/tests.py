# Create your tests here.
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from .models import Graph, Taxon, Phenology, Frequency


class PageTestCase(TestCase):

    def test_dashboard_page(self):
        response = self.client.get(reverse('taxon:dashboard'))
        self.assertEqual(response.status_code, 200)


class GraphTestCase(TestCase):

    def setUp(self):
        Graph.objects.create(label='graph1', title='titre',
                             model='model', height='25', sort=1)

    def test_graph_get_name(self):
        graph1 = Graph.objects.get(label='graph1')
        self.assertEqual(str(graph1), 'graph1')


class TaxonTestCase(TestCase):

    def setUp(self):
        Taxon.objects.create(full_name='taxon1', rank_name='family',
                             id_rang=1)

    def test_taxon_get_name(self):
        taxon1 = Taxon.objects.get(full_name='taxon1')
        self.assertEqual(str(taxon1), 'taxon1')


class FrequencyTestCase(TestCase):

    def setUp(self):
        Taxon.objects.create(full_name='taxon1', rank_name='family',
                             id_rang=1)
        taxon1 = Taxon.objects.get(full_name='taxon1')
        Frequency.objects.create(taxon=taxon1, class_object='frequency1',
                                 class_name='100', class_value=50.0)

    def test_frequency_get_name(self):
        frequency1 = Frequency.objects.get(class_object='frequency1')
        self.assertEqual(str(frequency1), 'taxon1 100')


class PhenologyTestCase(TestCase):

    def setUp(self):
        Taxon.objects.create(full_name='taxon1', rank_name='family',
                             id_rang=1)
        taxon1 = Taxon.objects.get(full_name='taxon1')
        Phenology.objects.create(taxon=taxon1, phenology='phenology1')

    def test_Phenology_get_name(self):
        phenology1 = Phenology.objects.get(phenology='phenology1')
        self.assertEqual(str(phenology1), 'taxon1 phenology1')
