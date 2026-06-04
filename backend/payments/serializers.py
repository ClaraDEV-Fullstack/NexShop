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
            'payment_url', 'error_message', 'created_at', 'paid_at',
        ]
        read_only_fields = fields


class InitPaymentSerializer(serializers.Serializer):
    """Initiate a CinetPay payment for an order."""

    CHANNEL_CHOICES = [
        ('ALL', 'All channels (card + mobile money)'),
        ('MOBILE_MONEY', 'Mobile Money only (Orange, MTN, Wave, Moov)'),
        ('CREDIT_CARD', 'Card only (Visa / Mastercard)'),
    ]

    order_id = serializers.IntegerField()
    channels = serializers.ChoiceField(choices=CHANNEL_CHOICES, default='ALL')

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
