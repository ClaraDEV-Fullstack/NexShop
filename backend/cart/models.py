from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class CartItem(models.Model):
    """Server-side cart for authenticated users — synced from localStorage on login."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'product', 'variant']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.product.name} x{self.quantity}"

    @property
    def unit_price(self):
        if self.variant:
            return self.variant.final_price
        return self.product.price

    @property
    def subtotal(self):
        return self.unit_price * self.quantity
