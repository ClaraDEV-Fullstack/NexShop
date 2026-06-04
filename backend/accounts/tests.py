from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class ChangePasswordTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='customer',
            email='customer@example.com',
            password='OldPassword123!',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_authenticated_user_can_change_password(self):
        response = self.client.post('/api/accounts/change-password/', {
            'current_password': 'OldPassword123!',
            'new_password': 'NewPassword456!',
            'confirm_password': 'NewPassword456!',
        })

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword456!'))
