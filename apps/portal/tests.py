from django.test import TestCase

# Create your tests here.
from django.urls import reverse


class PageTestCase(TestCase):

    def test_home_page(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    # def test_resource_page(self):
    #     response = self.client.get(reverse('resource'))
    #     self.assertEqual(response.status_code, 200)

    # def test_contact_page(self):
    #     response = self.client.get(reverse('contact'))
    #     self.assertEqual(response.status_code, 200)

    def test_methodologie_page(self):
        response = self.client.get(reverse('methodologie'))
        self.assertEqual(response.status_code, 200)

    def test_ressources_page(self):
        response = self.client.get(reverse('ressources'))
        self.assertEqual(response.status_code, 200)
