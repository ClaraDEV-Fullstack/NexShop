from django.db import models
from django.conf import settings
from orders.models import Order
import uuid


class Payment(models.Model):
    """Payment record — processed via CinetPay (card, Orange Money, MTN MoMo)"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    METHOD_CHOICES = [
        ('card', 'Visa / Mastercard'),
        ('orange_money', 'Orange Money'),
        ('mtn_money', 'MTN Mobile Money'),
        ('wave', 'Wave'),
        ('moov', 'Moov Money'),
        ('mobile_money', 'Mobile Money (other)'),
        ('unknown', 'Unknown'),
    ]

    reference = models.CharField(max_length=100, unique=True)
    transaction_id = models.CharField(
        max_length=100, blank=True, null=True, unique=True,
        help_text="CinetPay transaction ID",
    )
    payment_url = models.URLField(
        max_length=500, blank=True, null=True,
        help_text="CinetPay hosted checkout URL",
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments',
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='XOF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='unknown')

    payer_name = models.CharField(max_length=120, blank=True, default='')
    payer_phone = models.CharField(max_length=20, blank=True, default='')

    error_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.reference} — Order #{self.order.id} — {self.status}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)