from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'usage_limit',
            'times_used', 'valid_from', 'valid_until', 'is_active', 'is_valid',
        ]
        read_only_fields = ['id', 'times_used', 'is_valid']


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value.upper(), is_active=True)
            if not coupon.is_valid:
                raise serializers.ValidationError('This coupon has expired or reached its usage limit.')
            self._coupon = coupon
        except Coupon.DoesNotExist:
            raise serializers.ValidationError('Invalid coupon code.')
        return value.upper()

    def validate(self, attrs):
        coupon = getattr(self, '_coupon', None)
        if coupon and coupon.min_order_amount and attrs['subtotal'] < coupon.min_order_amount:
            raise serializers.ValidationError({
                'code': f'Minimum order of {coupon.min_order_amount} required for this coupon.'
            })
        return attrs

    def get_coupon(self):
        return self._coupon
