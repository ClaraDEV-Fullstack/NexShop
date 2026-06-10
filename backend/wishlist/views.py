from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import WishlistItem
from .serializers import WishlistItemSerializer, AddToWishlistSerializer
from products.models import Product
from alerts.services import notify_user, frontend_link


@extend_schema_view(
    list=extend_schema(tags=['Wishlist']),
    create=extend_schema(tags=['Wishlist']),
    destroy=extend_schema(tags=['Wishlist']),
)
class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for user wishlist"""

    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        """Return only current user's wishlist"""
        return WishlistItem.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return AddToWishlistSerializer
        return WishlistItemSerializer

    def create(self, request, *args, **kwargs):
        """Add item to wishlist"""
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            item = serializer.save()
            notify_user(
                request.user,
                'promo',
                'Added to wishlist',
                f'"{item.product.name}" was saved to your wishlist.',
                frontend_link('/wishlist'),
            )
            return Response(
                WishlistItemSerializer(item).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(tags=['Wishlist'])
    @action(detail=False, methods=['post'], url_path='toggle/(?P<product_id>[^/.]+)')
    def toggle(self, request, product_id=None):
        """Toggle product in wishlist (add if not exists, remove if exists)"""
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item = WishlistItem.objects.filter(
            user=request.user,
            product=product
        ).first()

        if wishlist_item:
            product_name = wishlist_item.product.name
            wishlist_item.delete()
            notify_user(
                request.user,
                'promo',
                'Removed from wishlist',
                f'"{product_name}" was removed from your wishlist.',
                frontend_link('/wishlist'),
            )
            return Response({
                'action': 'removed',
                'message': 'Product removed from wishlist'
            })
        else:
            item = WishlistItem.objects.create(user=request.user, product=product)
            notify_user(
                request.user,
                'promo',
                'Added to wishlist',
                f'"{product.name}" was saved to your wishlist.',
                frontend_link('/wishlist'),
            )
            return Response({
                'action': 'added',
                'message': 'Product added to wishlist',
                'item': WishlistItemSerializer(item).data
            })

    @extend_schema(tags=['Wishlist'])
    @action(detail=False, methods=['get'], url_path='check/(?P<product_id>[^/.]+)')
    def check(self, request, product_id=None):
        """Check if product is in user's wishlist"""
        is_in_wishlist = WishlistItem.objects.filter(
            user=request.user,
            product_id=product_id
        ).exists()

        return Response({'in_wishlist': is_in_wishlist})

    @extend_schema(tags=['Wishlist'])
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear entire wishlist"""
        count = WishlistItem.objects.filter(user=request.user).delete()[0]
        if count:
            notify_user(
                request.user,
                'promo',
                'Wishlist cleared',
                f'{count} item(s) were removed from your wishlist.',
                frontend_link('/wishlist'),
            )
        return Response({
            'message': f'Removed {count} items from wishlist'
        })