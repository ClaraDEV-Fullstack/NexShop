from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import (
    Category, Product, ProductImage, ProductSpecification,
    Brand, ShippingOption
)


def _one_per_category(queryset, limit: int = 8, offset: int = 0):
    """
    Return `limit` products with one (or two) from each active category.
    `offset` lets callers pick the Nth product from each category so
    featured / new_arrivals / bestsellers / on_sale never overlap.
    Products are sorted by category display_order then by id so the
    ordering is stable across requests.
    """
    from django.db.models import OuterRef, Subquery

    # Get all active categories ordered by their display order
    cats = Category.objects.filter(is_active=True).order_by('display_order', 'name')

    result = []
    for cat in cats:
        # Within each category take products ordered by id (stable)
        cat_products = list(
            queryset.filter(category=cat).order_by('id')
        )
        if offset < len(cat_products):
            result.append(cat_products[offset])
        elif cat_products:
            # fallback: wrap around so we never leave a category empty
            result.append(cat_products[offset % len(cat_products)])

        if len(result) >= limit:
            break

    return result
from .serializers import (
    CategorySerializer, CategoryListSerializer, CategoryTreeSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductImageSerializer, ProductSpecificationSerializer,
    BrandSerializer, BrandListSerializer,
    ShippingOptionSerializer,
)
# ============================================
# CATEGORY VIEWSET
# ============================================
@extend_schema_view(
    list=extend_schema(tags=['Categories'], summary='List all categories'),
    retrieve=extend_schema(tags=['Categories'], summary='Get category details'),
    create=extend_schema(tags=['Categories'], summary='Create category (Admin)'),
    update=extend_schema(tags=['Categories'], summary='Update category (Admin)'),
    partial_update=extend_schema(tags=['Categories'], summary='Partial update category (Admin)'),
    destroy=extend_schema(tags=['Categories'], summary='Delete category (Admin)'),
)
class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for product categories.

    Provides CRUD operations for categories with nested subcategories support.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'display_order', 'created_at']
    ordering = ['display_order', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'list':
            return CategoryListSerializer
        if self.action == 'tree':
            return CategoryTreeSerializer
        return CategorySerializer

    @extend_schema(tags=['Categories'], summary='Get root categories only')
    @action(detail=False, methods=['get'])
    def root(self, request):
        """Get only root categories (no parent)"""
        root_categories = self.queryset.filter(parent=None).order_by('display_order', 'name')
        serializer = CategorySerializer(root_categories, many=True)
        return Response(serializer.data)

    @extend_schema(tags=['Categories'], summary='Get full category tree')
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get full category tree for navigation"""
        root_categories = self.queryset.filter(parent=None).order_by('display_order', 'name')
        serializer = CategoryTreeSerializer(root_categories, many=True)
        return Response(serializer.data)

    @extend_schema(tags=['Categories'], summary='Get featured categories')
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured categories for homepage"""
        featured = self.queryset.filter(featured=True, parent=None).order_by('display_order')[:8]
        serializer = CategorySerializer(featured, many=True)
        return Response(serializer.data)

    @extend_schema(tags=['Categories'], summary='Get subcategories')
    @action(detail=True, methods=['get'])
    def subcategories(self, request, slug=None):
        """Get subcategories for a specific category"""
        category = self.get_object()
        subcategories = category.children.filter(is_active=True).order_by('display_order', 'name')
        serializer = CategoryListSerializer(subcategories, many=True)
        return Response(serializer.data)


# ============================================
# BRAND VIEWSET
# ============================================
@extend_schema_view(
    list=extend_schema(tags=['Brands'], summary='List all brands'),
    retrieve=extend_schema(tags=['Brands'], summary='Get brand details'),
    create=extend_schema(tags=['Brands'], summary='Create brand (Admin)'),
    update=extend_schema(tags=['Brands'], summary='Update brand (Admin)'),
    partial_update=extend_schema(tags=['Brands'], summary='Partial update brand (Admin)'),
    destroy=extend_schema(tags=['Brands'], summary='Delete brand (Admin)'),
)
class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet for product brands"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'list':
            return BrandListSerializer
        return BrandSerializer

    @extend_schema(tags=['Brands'], summary='Get featured brands')
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured brands for homepage"""
        featured = self.queryset.filter(is_featured=True)[:10]
        serializer = BrandListSerializer(featured, many=True)
        return Response(serializer.data)


# ============================================
# PRODUCT VIEWSET
# ============================================
@extend_schema_view(
    list=extend_schema(tags=['Products'], summary='List all products'),
    retrieve=extend_schema(tags=['Products'], summary='Get product details'),
    create=extend_schema(tags=['Products'], summary='Create product (Admin)'),
    update=extend_schema(tags=['Products'], summary='Update product (Admin)'),
    partial_update=extend_schema(tags=['Products'], summary='Partial update product (Admin)'),
    destroy=extend_schema(tags=['Products'], summary='Delete product (Admin)'),
)
class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for products with filtering, search, and ordering"""
    queryset = Product.objects.filter(is_available=True).select_related('category', 'brand').prefetch_related('images', 'variants')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'brand__slug', 'featured', 'is_available', 'product_type', 'is_new', 'is_bestseller']
    search_fields = ['name', 'description', 'short_description', 'sku', 'brand__name']
    ordering_fields = ['price', 'created_at', 'name', 'stock']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Category filter (includes subcategories)
        category = self.request.query_params.get('category', None)
        if category:
            try:
                cat = Category.objects.get(slug=category)
                cat_ids = [cat.id]
                cat_ids.extend(cat.children.filter(is_active=True).values_list('id', flat=True))
                queryset = queryset.filter(category_id__in=cat_ids)
            except Category.DoesNotExist:
                queryset = queryset.filter(category__slug=category)

        # Brand filter
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(brand__slug=brand)

        # Price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Stock filter
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)

        # On sale filter
        on_sale = self.request.query_params.get('on_sale', None)
        if on_sale == 'true':
            queryset = queryset.filter(compare_price__isnull=False, compare_price__gt=0)

        return queryset

    @extend_schema(tags=['Products'], summary='Get featured products')
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """One product per category, round-robined — guarantees all categories appear."""
        products = _one_per_category(self.queryset, limit=8, offset=0)
        return Response(ProductListSerializer(products, many=True, context={'request': request}).data)

    @extend_schema(tags=['Products'], summary='Get new arrivals')
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Second product from each category — different from featured, all categories shown."""
        products = _one_per_category(self.queryset, limit=8, offset=1)
        return Response(ProductListSerializer(products, many=True, context={'request': request}).data)

    @extend_schema(tags=['Products'], summary='Get bestsellers')
    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        """Third product from each category — no overlap with featured or new arrivals."""
        products = _one_per_category(self.queryset, limit=8, offset=2)
        return Response(ProductListSerializer(products, many=True, context={'request': request}).data)

    @extend_schema(tags=['Products'], summary='Get products on sale')
    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        """Fourth product from each category — all discounted, all categories."""
        products = _one_per_category(
            self.queryset.filter(compare_price__isnull=False, compare_price__gt=0),
            limit=4, offset=3,
        )
        return Response(ProductListSerializer(products, many=True, context={'request': request}).data)

    @extend_schema(tags=['Products'], summary='Search products')
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search products by name, description, brand, or category"""
        query = request.query_params.get('q', '')
        if query:
            products = self.queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query) |
                Q(brand__name__icontains=query)
            )[:20]
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data)
        return Response([])

    @extend_schema(tags=['Products'], summary='Get related products')
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related products"""
        product = self.get_object()
        related = self.queryset.filter(
            Q(category=product.category) | Q(brand=product.brand)
        ).exclude(id=product.id)[:6]
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)


# ============================================
# PRODUCT IMAGE VIEWSET
# ============================================
@extend_schema_view(
    list=extend_schema(tags=['Products'], summary='List product images'),
    create=extend_schema(tags=['Products'], summary='Add product image (Admin)'),
    retrieve=extend_schema(tags=['Products'], summary='Get product image'),
    update=extend_schema(tags=['Products'], summary='Update product image (Admin)'),
    partial_update=extend_schema(tags=['Products'], summary='Partial update image (Admin)'),
    destroy=extend_schema(tags=['Products'], summary='Delete product image (Admin)'),
)
class ProductImageViewSet(viewsets.ModelViewSet):
    """ViewSet for product images (admin only)"""
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        product_slug = self.kwargs.get('product_slug')
        if product_slug:
            return self.queryset.filter(product__slug=product_slug)
        return self.queryset

    def perform_create(self, serializer):
        product_slug = self.kwargs.get('product_slug')
        product = Product.objects.get(slug=product_slug)
        serializer.save(product=product)


# ============================================
# SHIPPING OPTION VIEWSET
# ============================================
@extend_schema_view(
    list=extend_schema(tags=['Shipping'], summary='List shipping options'),
    retrieve=extend_schema(tags=['Shipping'], summary='Get shipping option details'),
)
class ShippingOptionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for shipping options (read-only for customers)"""
    queryset = ShippingOption.objects.filter(is_active=True)
    serializer_class = ShippingOptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(tags=['Shipping'], summary='Get available shipping with free shipping check')
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available shipping options for an order total"""
        order_total = request.query_params.get('total', 0)
        try:
            total = float(order_total)
        except ValueError:
            total = 0

        options = self.queryset.all()
        result = []

        for option in options:
            option_data = ShippingOptionSerializer(option).data
            if option.free_shipping_threshold and total >= float(option.free_shipping_threshold):
                option_data['price'] = '0.00'
                option_data['free_shipping_applied'] = True
            else:
                option_data['free_shipping_applied'] = False
            result.append(option_data)

        return Response(result)
