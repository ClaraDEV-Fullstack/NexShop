from django.contrib import admin
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Pricing', {'fields': ('tax_rate', 'free_shipping_threshold', 'default_shipping_cost')}),
        ('Currency', {'fields': ('currency', 'currency_symbol')}),
        ('Store', {'fields': ('store_name', 'support_email', 'low_stock_alert_email')}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
