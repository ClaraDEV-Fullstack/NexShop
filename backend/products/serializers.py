# products/serializers.py

from rest_framework import serializers
from django.db.models import Avg
from urllib.parse import unquote
import re
from .models import (
    Category, Product, ProductImage, ProductSpecification,
    Brand, ShippingOption, ProductVariant
)


# ============ IMAGE URL HELPER ============

def _supabase_public_url(relative_path):
    """Build a public Supabase Storage URL from a stored file path."""
    from django.conf import settings

    supabase_url = getattr(settings, 'SUPABASE_URL', '')
    service_key = getattr(settings, 'SUPABASE_SERVICE_KEY', '')
    if not supabase_url or not service_key:
        return None

    bucket = getattr(settings, 'SUPABASE_BUCKET', 'media')
    clean = relative_path.lstrip('/')
    if clean.startswith('media/'):
        clean = clean[len('media/'):]
    return f'{supabase_url.rstrip("/")}/storage/v1/object/public/{bucket}/{clean}'


def get_image_url(image_field, request=None):
    """
    Return a browser-ready image URL.
    Handles Cloudinary/Supabase CDN URLs, localhost paths, and relative storage paths.
    """
    from django.conf import settings

    if not image_field:
        return None

    try:
        if hasattr(image_field, 'url'):
            url = image_field.url
        elif hasattr(image_field, 'name'):
            url = image_field.name
        else:
            url = str(image_field)

        if not url:
            return None

        url = unquote(url)

        cloudinary_pattern = r'(https?://res\.cloudinary\.com/[^\s]+)'
        match = re.search(cloudinary_pattern, url)
        if match:
            return match.group(1)

        if 'res.cloudinary.com' in url:
            cloudinary_match = re.search(r'(res\.cloudinary\.com/[^\s]+)', url)
            if cloudinary_match:
                return 'https://' + cloudinary_match.group(1)

        if url.startswith('/media/https:/'):
            url = 'https://' + url[14:]
        elif url.startswith('/media/http:/'):
            url = 'http://' + url[13:]
        elif url.startswith('https:/') and not url.startswith('https://'):
            url = 'https://' + url[7:]
        elif url.startswith('http:/') and not url.startswith('http://'):
            url = 'http://' + url[6:]

        supabase_pattern = r'(https?://[^/]+\.supabase\.co/storage/v1/object/public/[^\s]+)'
        supabase_match = re.search(supabase_pattern, url)
        if supabase_match:
            return supabase_match.group(1)

        if url.startswith('http://') or url.startswith('https://'):
            if 'localhost' in url or '127.0.0.1' in url:
                from urllib.parse import urlparse
                path = urlparse(url).path
                if '/media/' in path:
                    rel = path.split('/media/', 1)[-1]
                    supabase_url = _supabase_public_url(rel)
                    if supabase_url:
                        return supabase_url
                backend = getattr(settings, 'BACKEND_URL', '')
                if backend:
                    return f"{backend.rstrip('/')}{path}"
            return url

        if hasattr(image_field, 'build_url'):
            try:
                built_url = image_field.build_url()
                if built_url:
                    return built_url
            except Exception:
                pass

        if url.startswith('/media/'):
            rel = url.split('/media/', 1)[-1]
            supabase_url = _supabase_public_url(rel)
            if supabase_url:
                return supabase_url

        supabase_url = _supabase_public_url(url)
        if supabase_url:
            return supabase_url

        if url.startswith('/'):
            if request:
                return request.build_absolute_uri(url)
            backend = getattr(settings, 'BACKEND_URL', '')
            if backend:
                return f"{backend.rstrip('/')}{url}"

        return url

    except Exception as e:
        print(f"Error getting image URL for {image_field}: {e}")
        return None


# ============ BRAND SERIALIZERS ============

class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'logo', 'logo_url', 'description',
            'website', 'is_featured', 'product_count'
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True).count()

    def get_logo_url(self, obj):
        return get_image_url(obj.logo, self.context.get('request'))


class BrandListSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'logo_url']

    def get_logo_url(self, obj):
        return get_image_url(obj.logo, self.context.get('request'))


# ============ CATEGORY SERIALIZERS ============

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url', 'icon',
            'parent', 'parent_name', 'children', 'product_count',
            'is_active', 'featured', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        return get_image_url(obj.image, self.context.get('request'))

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('display_order', 'name')
        return CategoryListSerializer(children, many=True, context=self.context).data

    def get_product_count(self, obj):
        count = obj.products.filter(is_available=True).count()
        for child in obj.children.filter(is_active=True):
            count += child.products.filter(is_available=True).count()
        return count


class CategoryListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'image_url', 'icon', 'product_count', 'parent']

    def get_image_url(self, obj):
        return get_image_url(obj.image, self.context.get('request'))

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True).count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'image', 'image_url', 'children', 'product_count']

    def get_image_url(self, obj):
        return get_image_url(obj.image, self.context.get('request'))

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('display_order', 'name')
        return CategoryTreeSerializer(children, many=True, context=self.context).data

    def get_product_count(self, obj):
        count = obj.products.filter(is_available=True).count()
        for child in obj.children.filter(is_active=True):
            count += child.products.filter(is_available=True).count()
        return count


# ============ PRODUCT IMAGE SERIALIZER ============

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            'id',
            'image_url',
            'alt_text',
            'is_primary',
            'order'
        ]

    def get_image_url(self, obj):
        if obj.image:
            return get_image_url(obj.image, self.context.get('request'))
        return None


# ============ PRODUCT VARIANT SERIALIZER ============

class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'value', 'sku', 'price_adjustment', 'final_price', 'stock', 'is_available']
        read_only_fields = ['id', 'final_price']


# ============ PRODUCT SPECIFICATION SERIALIZER ============

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'order']
        read_only_fields = ['id']


# ============ PRODUCT SERIALIZERS ============

class ProductListSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    brand = BrandListSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description',
            'price', 'compare_price', 'discount_percentage',
            'category', 'brand', 'primary_image',
            'in_stock', 'stock', 'featured', 'is_new', 'is_bestseller',
            'average_rating', 'review_count', 'product_type'
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        return None

    def get_average_rating(self, obj):
        if hasattr(obj, 'reviews'):
            reviews = obj.reviews.filter(is_approved=True)
            if reviews.exists():
                avg = reviews.aggregate(Avg('rating'))['rating__avg']
                return round(avg, 1) if avg else 0
        return 0

    def get_review_count(self, obj):
        if hasattr(obj, 'reviews'):
            return obj.reviews.filter(is_approved=True).count()
        return 0


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source='brand',
        write_only=True,
        required=False,
        allow_null=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'product_type', 'price', 'compare_price', 'discount_percentage',
            'sku', 'stock', 'is_available', 'in_stock', 'is_low_stock',
            'category', 'category_id', 'brand', 'brand_id',
            'weight', 'dimensions', 'meta_title', 'meta_description',
            'images', 'specifications', 'variants',
            'featured', 'is_new', 'is_bestseller',
            'average_rating', 'review_count', 'related_products',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        if hasattr(obj, 'reviews'):
            reviews = obj.reviews.filter(is_approved=True)
            if reviews.exists():
                avg = reviews.aggregate(Avg('rating'))['rating__avg']
                return round(avg, 1) if avg else 0
        return 0

    def get_review_count(self, obj):
        if hasattr(obj, 'reviews'):
            return obj.reviews.filter(is_approved=True).count()
        return 0

    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category,
            is_available=True
        ).exclude(id=obj.id)[:4]
        return ProductListSerializer(related, many=True, context=self.context).data


class ProductCreateSerializer(serializers.ModelSerializer):
    specifications = ProductSpecificationSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'short_description',
            'product_type', 'price', 'compare_price',
            'sku', 'stock', 'low_stock_threshold', 'is_available',
            'category', 'brand', 'weight', 'dimensions',
            'meta_title', 'meta_description',
            'featured', 'is_new', 'is_bestseller',
            'specifications'
        ]

    def create(self, validated_data):
        specifications_data = validated_data.pop('specifications', [])
        product = Product.objects.create(**validated_data)
        for spec_data in specifications_data:
            ProductSpecification.objects.create(product=product, **spec_data)
        return product

    def update(self, instance, validated_data):
        specifications_data = validated_data.pop('specifications', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if specifications_data is not None:
            instance.specifications.all().delete()
            for spec_data in specifications_data:
                ProductSpecification.objects.create(product=instance, **spec_data)

        return instance


# ============ SHIPPING OPTION SERIALIZER ============

class ShippingOptionSerializer(serializers.ModelSerializer):
    delivery_estimate = serializers.ReadOnlyField()

    class Meta:
        model = ShippingOption
        fields = [
            'id', 'name', 'description', 'price',
            'estimated_days_min', 'estimated_days_max', 'delivery_estimate',
            'free_shipping_threshold', 'regions', 'is_default'
        ]