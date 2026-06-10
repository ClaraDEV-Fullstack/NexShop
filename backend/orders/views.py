from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.db import transaction
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer
from products.models import Product
from .emails import send_order_confirmation_email
from alerts.services import notify_user, frontend_link
import logging

logger = logging.getLogger(__name__)


def cancel_order(order_id, user):
    """Cancel an order once and restore its inventory."""
    with transaction.atomic():
        order = Order.objects.select_for_update().get(id=order_id, user=user)

        if order.status not in ['pending', 'processing']:
            return order, False

        items = list(order.items.select_related('product'))
        product_ids = [item.product_id for item in items if item.product_id]
        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        for item in items:
            product = products.get(item.product_id)
            if product:
                product.stock += item.quantity
                product.save(update_fields=['stock'])

        order.status = 'cancelled'
        order.save(update_fields=['status', 'updated_at'])
        return order, True


@extend_schema_view(
    list=extend_schema(tags=['Orders']),
    retrieve=extend_schema(tags=['Orders']),
    create=extend_schema(tags=['Orders']),
)
class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for customer orders"""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        """Return only orders for current user"""
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use different serializer for creating orders"""
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        """Create a new order"""
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            order = serializer.save()

            logger.info('Order #%s created successfully', order.id)
            try:
                send_order_confirmation_email(order)
            except Exception as exc:
                logger.error('Failed to send order confirmation email for #%s: %s', order.id, exc)

            notify_user(
                request.user,
                'order',
                f'Order #{order.id} placed',
                f'Your order totaling {order.total} XOF has been placed. Complete payment to confirm.',
                frontend_link(f'/orders/{order.id}'),
            )

            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Cancel/Delete an order - only if pending or processing"""
        order = self.get_object()
        order, cancelled = cancel_order(order.id, request.user)

        if not cancelled:
            return Response(
                {'detail': f'Cannot cancel order with status "{order.get_status_display()}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        notify_user(
            request.user,
            'order',
            f'Order #{order.id} cancelled',
            'Your order has been cancelled and inventory has been restored.',
            frontend_link('/orders'),
        )

        return Response(
            {'detail': 'Order cancelled successfully.'},
            status=status.HTTP_200_OK
        )

    @extend_schema(tags=['Orders'])
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Alternative cancel endpoint"""
        order = self.get_object()
        order, cancelled = cancel_order(order.id, request.user)

        if not cancelled:
            return Response(
                {'detail': f'Cannot cancel order with status "{order.get_status_display()}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        notify_user(
            request.user,
            'order',
            f'Order #{order.id} cancelled',
            'Your order has been cancelled and inventory has been restored.',
            frontend_link('/orders'),
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK
        )
