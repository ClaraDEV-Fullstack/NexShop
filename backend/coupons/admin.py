from django.contrib import admin
from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'times_used', 'usage_limit', 'is_active', 'valid_until']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
    readonly_fields = ['times_used', 'created_at']
