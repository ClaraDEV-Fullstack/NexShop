from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import CartItem
from .serializers import CartItemSerializer, CartSyncSerializer
from alerts.services import notify_user, frontend_link


@extend_schema_view(
    list=extend_schema(tags=['Cart']),
    create=extend_schema(tags=['Cart']),
    destroy=extend_schema(tags=['Cart']),
)
class CartViewSet(viewsets.ModelViewSet):
    """Backend cart for authenticated users."""

    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product', 'variant')

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data.get('quantity', 1)

        existing = CartItem.objects.filter(
            user=self.request.user, product=product, variant=variant
        ).first()

        if existing:
            existing.quantity += quantity
            existing.save(update_fields=['quantity', 'updated_at'])
        else:
            item = serializer.save(user=self.request.user)
            notify_user(
                self.request.user,
                'system',
                'Added to cart',
                f'"{product.name}" was added to your cart.',
                frontend_link('/cart'),
            )

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        product_name = item.product.name
        response = super().destroy(request, *args, **kwargs)
        notify_user(
            request.user,
            'system',
            'Removed from cart',
            f'"{product_name}" was removed from your cart.',
            frontend_link('/cart'),
        )
        return response

    @extend_schema(tags=['Cart'])
    @action(detail=False, methods=['post'], url_path='sync')
    def sync(self, request):
        """
        Bulk-sync cart items from frontend localStorage.
        Merges with any existing server-side cart.
        """
        serializer = CartSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items = serializer.validated_data['items']
        for item_data in items:
            product = item_data['product']
            variant = item_data.get('variant')
            quantity = item_data.get('quantity', 1)
            CartItem.objects.update_or_create(
                user=request.user,
                product=product,
                variant=variant,
                defaults={'quantity': quantity},
            )

        cart = CartItem.objects.filter(user=request.user).select_related('product', 'variant')
        return Response(CartItemSerializer(cart, many=True).data)

    @extend_schema(tags=['Cart'])
    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        count = CartItem.objects.filter(user=request.user).count()
        CartItem.objects.filter(user=request.user).delete()
        if count:
            notify_user(
                request.user,
                'system',
                'Cart cleared',
                f'{count} item(s) were removed from your cart.',
                frontend_link('/cart'),
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
