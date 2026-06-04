import logging
from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product

logger = logging.getLogger(__name__)


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'product_image', 'product_slug', 'quantity', 'subtotal',
        ]
        read_only_fields = ['id', 'product_name', 'product_price', 'product_image', 'product_slug']

    def get_subtotal(self, obj):
        return str(obj.get_subtotal())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'status_display', 'payment_status', 'payment_status_display',
            'shipping_address', 'shipping_city', 'shipping_country', 'shipping_phone',
            'subtotal', 'shipping_cost', 'tax', 'discount', 'total',
            'coupon_code', 'notes', 'guest_email',
            'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'subtotal', 'shipping_cost', 'tax', 'total', 'created_at', 'updated_at']


class CreateOrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_country = serializers.CharField(max_length=100)
    shipping_phone = serializers.CharField(max_length=20)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = CreateOrderItemSerializer(many=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')
    # Guest checkout: provide email if not authenticated
    guest_email = serializers.EmailField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")

        quantities = {}
        for item in value:
            pid = item['product_id']
            quantities[pid] = quantities.get(pid, 0) + item['quantity']

        for pid, qty in quantities.items():
            try:
                product = Product.objects.get(id=pid, is_available=True)
                if product.stock < qty:
                    raise serializers.ValidationError(
                        f"Not enough stock for {product.name}. Available: {product.stock}"
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {pid} not found.")

        return [{'product_id': pid, 'quantity': qty} for pid, qty in quantities.items()]

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        user = request.user if request.user.is_authenticated else None
        items_data = validated_data.pop('items')
        coupon_code = validated_data.pop('coupon_code', '').strip().upper()
        guest_email = validated_data.pop('guest_email', '')

        # Resolve coupon discount
        discount = 0
        if coupon_code:
            try:
                from coupons.models import Coupon
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                # We'll apply discount after subtotal is known
            except Coupon.DoesNotExist:
                coupon_code = ''
                coupon = None
        else:
            coupon = None

        product_ids = [i['product_id'] for i in items_data]
        products = {
            p.id: p for p in Product.objects.select_for_update().filter(
                id__in=product_ids, is_available=True,
            )
        }

        # Re-validate stock under lock
        for item_data in items_data:
            product = products.get(item_data['product_id'])
            if not product or product.stock < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Not enough stock for product {item_data['product_id']}."
                )

        order = Order.objects.create(
            user=user,
            guest_email=guest_email if not user else '',
            coupon_code=coupon_code,
            **{k: validated_data[k] for k in
               ('shipping_address', 'shipping_city', 'shipping_country', 'shipping_phone', 'notes')},
        )

        for item_data in items_data:
            product = products[item_data['product_id']]
            primary_image = (
                product.images.filter(is_primary=True).first() or product.images.first()
            )
            image_url = None
            if primary_image and primary_image.image:
                try:
                    image_url = primary_image.image.url
                except Exception:
                    pass

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=product.price,
                product_image=image_url,
                product_slug=product.slug,
                quantity=item_data['quantity'],
            )

            product.stock -= item_data['quantity']
            product.save(update_fields=['stock'])

            # Trigger low-stock alert
            if product.stock <= product.low_stock_threshold:
                _send_low_stock_alert(product)

        # Apply coupon after subtotal is computed
        if coupon:
            subtotal = sum(
                p.price * next(i['quantity'] for i in items_data if i['product_id'] == pid)
                for pid, p in products.items()
            )
            order.discount = coupon.calculate_discount(subtotal)
            coupon.times_used += 1
            coupon.save(update_fields=['times_used'])

        order.calculate_totals()
        return order


def _send_low_stock_alert(product):
    """Non-blocking low-stock notification to the configured admin email."""
    import threading
    from config.models import SiteSettings
    from orders.emails import send_email_async

    cfg = SiteSettings.get()
    alert_email = cfg.low_stock_alert_email
    if not alert_email:
        return

    def _send():
        subject = f"Low stock alert: {product.name}"
        text = f"Product '{product.name}' (SKU: {product.sku}) has only {product.stock} unit(s) left."
        html = f"""
        <p>Stock alert for <strong>{product.name}</strong>:</p>
        <ul>
          <li>SKU: {product.sku}</li>
          <li>Current stock: <strong style="color:red">{product.stock}</strong></li>
          <li>Threshold: {product.low_stock_threshold}</li>
        </ul>
        """
        try:
            send_email_async(subject, text, html, alert_email)
        except Exception as exc:
            logger.error('Failed to send low-stock alert for %s: %s', product.name, exc)

    threading.Thread(target=_send, daemon=True).start()
