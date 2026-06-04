from rest_framework import serializers
from .models import CartItem
from products.models import Product, ProductVariant


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    variant_label = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'product_price',
            'variant', 'variant_label', 'quantity', 'unit_price', 'subtotal',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_variant_label(self, obj):
        if obj.variant:
            return f"{obj.variant.name}: {obj.variant.value}"
        return None


class CartSyncItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_available=True))
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_available=True),
        required=False, allow_null=True,
    )
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartSyncSerializer(serializers.Serializer):
    items = CartSyncItemSerializer(many=True)
