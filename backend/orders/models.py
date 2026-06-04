from django.db import models
from django.conf import settings
from products.models import Product


class Order(models.Model):
    """Customer order containing multiple items"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='orders',
        help_text="Authenticated customer (null for guest checkout)",
    )
    guest_email = models.EmailField(
        blank=True, null=True,
        help_text="Email for guest order confirmation",
    )
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current order status"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        help_text="Payment status"
    )

    shipping_address = models.TextField(help_text="Full shipping address")
    shipping_city = models.CharField(max_length=100, help_text="City")
    shipping_country = models.CharField(max_length=100, help_text="Country")
    shipping_phone = models.CharField(max_length=20, help_text="Contact phone")

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Total before shipping and tax"
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Shipping fee"
    )
    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Tax amount"
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Final total (subtotal + shipping + tax)"
    )

    notes = models.TextField(blank=True, help_text="Order notes from customer")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

    def calculate_totals(self):
        """Calculate order totals using SiteSettings."""
        from config.models import SiteSettings
        cfg = SiteSettings.get()
        self.subtotal = sum(item.get_subtotal() for item in self.items.all())
        net = self.subtotal - self.discount
        self.shipping_cost = 0 if net >= cfg.free_shipping_threshold else cfg.default_shipping_cost
        self.tax = net * cfg.tax_rate
        self.total = net + self.shipping_cost + self.tax
        self.save()


class OrderItem(models.Model):
    """Individual item within an order"""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Parent order"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        help_text="Product ordered"
    )

    # Store product info at time of order (snapshot)
    product_name = models.CharField(max_length=255, help_text="Product name at order time")
    product_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Price at order time"
    )
    product_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Product image URL at order time"
    )
    product_slug = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Product slug for linking"
    )
    quantity = models.PositiveIntegerField(default=1, help_text="Quantity ordered")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    def get_subtotal(self):
        """Calculate item subtotal safely"""
        if self.product_price and self.quantity:
            return self.product_price * self.quantity
        return 0

    @property
    def subtotal(self):
        """Property for templates and serializers"""
        return self.get_subtotal()