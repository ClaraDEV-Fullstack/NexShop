from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, ProductImageViewSet,
    BrandViewSet, ShippingOptionViewSet
)
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'shipping-options', ShippingOptionViewSet, basename='shipping-option')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'products/<slug:product_slug>/images/',
        ProductImageViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='product-images'
    ),
]
# products/urls.py

