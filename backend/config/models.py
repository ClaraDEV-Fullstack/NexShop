from django.db import models


class SiteSettings(models.Model):
    """Single-row configuration table for store-wide settings."""

    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=4, default=0.10,
        help_text="Tax rate as decimal, e.g. 0.10 = 10%",
    )
    free_shipping_threshold = models.DecimalField(
        max_digits=10, decimal_places=2, default=50.00,
        help_text="Order subtotal above which shipping is free",
    )
    default_shipping_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=5.00,
        help_text="Flat shipping cost when below the free threshold",
    )
    currency = models.CharField(max_length=10, default='XOF')
    currency_symbol = models.CharField(max_length=5, default='₣')
    store_name = models.CharField(max_length=100, default='NextShopSphere')
    support_email = models.EmailField(blank=True, default='')
    low_stock_alert_email = models.EmailField(
        blank=True,
        help_text="Email to notify when a product goes below low_stock_threshold",
    )

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return f"Site Settings ({self.store_name})"

    def save(self, *args, **kwargs):
        self.pk = 1  # Singleton — only one row allowed
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
