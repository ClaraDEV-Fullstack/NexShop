import re

from rest_framework import serializers
from .models import Payment
from orders.models import Order


class PaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'reference', 'transaction_id', 'order', 'amount', 'currency',
            'status', 'status_display', 'payment_method', 'payment_method_display',
            'payment_url', 'payer_name', 'payer_phone', 'error_message',
            'created_at', 'paid_at',
        ]
        read_only_fields = fields


class InitPaymentSerializer(serializers.Serializer):
    """Initiate a mobile money payment (Orange Money or MTN MoMo)."""

    PAYMENT_METHOD_CHOICES = [
        ('orange_money', 'Orange Money'),
        ('mtn_money', 'MTN Mobile Money'),
    ]

    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=PAYMENT_METHOD_CHOICES)
    phone_number = serializers.CharField(max_length=20)
    payer_name = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_phone_number(self, value):
        cleaned = re.sub(r'[\s\-()]', '', value.strip())
        if cleaned.startswith('+'):
            digits = cleaned[1:]
        else:
            digits = cleaned

        if not digits.isdigit() or len(digits) < 9 or len(digits) > 15:
            raise serializers.ValidationError(
                'Enter a valid mobile money number (9–15 digits, optional + prefix).'
            )
        return cleaned

    def validate_order_id(self, value):
        user = self.context['request'].user
        try:
            order = Order.objects.get(id=value, user=user)
        except Order.DoesNotExist:
            raise serializers.ValidationError('Order not found.')
        if order.payment_status == 'paid':
            raise serializers.ValidationError('This order is already paid.')
        if order.status == 'cancelled':
            raise serializers.ValidationError('Cannot pay for a cancelled order.')
        return value
