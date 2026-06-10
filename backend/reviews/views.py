from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer, ProductReviewStatsSerializer
from products.models import Product
from alerts.services import notify_user, frontend_link


@extend_schema_view(
    list=extend_schema(tags=['Reviews']),
    retrieve=extend_schema(tags=['Reviews']),
    create=extend_schema(tags=['Reviews']),
    update=extend_schema(tags=['Reviews']),
    destroy=extend_schema(tags=['Reviews']),
)
class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for product reviews"""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter reviews by product if specified"""
        queryset = Review.objects.filter(is_approved=True).select_related('user')

        product_slug = self.request.query_params.get('product', None)
        if product_slug:
            queryset = queryset.filter(product__slug=product_slug)

        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateReviewSerializer
        return ReviewSerializer

    def get_serializer_context(self):
        """Include request in serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        notify_user(
            self.request.user,
            'system',
            'Review submitted',
            f'Your review for "{review.product.name}" has been submitted and is pending approval.',
            frontend_link(f'/products/{review.product.slug}'),
        )

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {'detail': 'You can only delete your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        product_name = review.product.name
        response = super().destroy(request, *args, **kwargs)
        notify_user(
            request.user,
            'system',
            'Review deleted',
            f'Your review for "{product_name}" was removed.',
            frontend_link('/dashboard'),
        )
        return response

    def update(self, request, *args, **kwargs):
        """Only allow users to update their own reviews"""
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {'detail': 'You can only edit your own reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    @extend_schema(tags=['Reviews'])
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get current user's reviews"""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        reviews = Review.objects.filter(user=request.user).select_related('user')
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(tags=['Reviews'])
    @action(detail=False, methods=['get'], url_path='product/(?P<product_slug>[^/.]+)/stats')
    def product_stats(self, request, product_slug=None):
        """Get review statistics for a product"""
        try:
            product = Product.objects.get(slug=product_slug)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reviews = Review.objects.filter(product=product, is_approved=True)

        # Calculate stats
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id')
        )

        # Rating distribution
        distribution = {}
        for i in range(1, 6):
            count = reviews.filter(rating=i).count()
            distribution[str(i)] = count

        return Response({
            'average_rating': round(stats['average_rating'] or 0, 1),
            'total_reviews': stats['total_reviews'],
            'rating_distribution': distribution
        })

    @extend_schema(tags=['Reviews'])
    @action(detail=False, methods=['get'], url_path='check/(?P<product_id>[^/.]+)')
    def check_review(self, request, product_id=None):
        """Check if user has already reviewed a product"""
        if not request.user.is_authenticated:
            return Response({'has_reviewed': False, 'review': None})

        try:
            review = Review.objects.select_related('user').get(
                user=request.user,
                product_id=product_id
            )
            return Response({
                'has_reviewed': True,
                'review': ReviewSerializer(review, context={'request': request}).data
            })
        except Review.DoesNotExist:
            return Response({'has_reviewed': False, 'review': None})