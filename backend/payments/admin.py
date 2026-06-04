from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'reference', 'order', 'user', 'amount', 'currency', 'status', 'payment_method', 'created_at', 'paid_at']
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = ['reference', 'transaction_id', 'order__id', 'user__email']
    readonly_fields = ['reference', 'transaction_id', 'payment_url', 'created_at', 'updated_at', 'paid_at']
    raw_id_fields = ['order', 'user']

    fieldsets = (
        ('Payment Info', {
            'fields': ('reference', 'transaction_id', 'order', 'user', 'amount', 'currency', 'status', 'payment_method'),
        }),
        ('CinetPay', {
            'fields': ('payment_url',),
        }),
        ('Status', {
            'fields': ('error_message',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at'),
        }),
    )
