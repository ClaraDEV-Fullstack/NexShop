from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from products.models import Category, Product


class OrderInventoryTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='customer',
            email='customer@example.com',
            password='Password123!',
        )
        category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            name='Phone',
            slug='phone',
            description='A phone',
            price='100.00',
            sku='PHONE-1',
            stock=5,
            category=category,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def create_order(self, items):
        return self.client.post('/api/orders/', {
            'shipping_address': '1 Main Street',
            'shipping_city': 'Douala',
            'shipping_country': 'Cameroon',
            'shipping_phone': '+237600000000',
            'items': items,
        }, format='json')

    def test_duplicate_product_lines_are_aggregated(self):
        response = self.create_order([
            {'product_id': self.product.id, 'quantity': 2},
            {'product_id': self.product.id, 'quantity': 2},
        ])

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 4)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_order_cancellation_restores_stock_only_once(self):
        create_response = self.create_order([
            {'product_id': self.product.id, 'quantity': 2},
        ])
        order_id = create_response.data['id']

        first_response = self.client.post(f'/api/orders/{order_id}/cancel/')
        second_response = self.client.post(f'/api/orders/{order_id}/cancel/')

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
