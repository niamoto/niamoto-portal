# Create your tests here.
from django.test import TestCase

# Create your tests here.
from django.urls import reverse


class PageTestCase(TestCase):

    def test_dashboard_page(self):
        response = self.client.get(reverse('dashboard_plot'))
        self.assertEqual(response.status_code, 200)