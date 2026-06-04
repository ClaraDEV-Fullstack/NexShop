from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import UserNotification


class NotificationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='customer',
            email='customer@example.com',
            password='Password123!',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_mark_all_read_accepts_post(self):
        notification = UserNotification.objects.create(
            user=self.user,
            title='Order created',
            message='Your order is waiting for payment.',
        )

        response = self.client.post('/api/notifications/mark_all_read/')

        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
