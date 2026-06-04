from django.test import TestCase
from rest_framework.test import APIClient


class PublicEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint_is_available(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'healthy')

    def test_cloudinary_debug_endpoint_is_not_exposed(self):
        response = self.client.get('/api/debug-cloudinary/')

        self.assertEqual(response.status_code, 404)
