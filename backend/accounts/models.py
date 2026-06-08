from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model for NEXSHOP"""

    email = models.EmailField(
        unique=True,
        help_text="User's email address (used for login)"
    )
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Phone number (e.g., +1234567890)"
    )
    address = models.TextField(
        blank=True,
        null=True,
        help_text="Full street address for shipping"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="City name (e.g., New York)"
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Country name (e.g., United States)"
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email