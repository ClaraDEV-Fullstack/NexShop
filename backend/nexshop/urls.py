"""
URL configuration for nexshop project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Import settings to access DEBUG and MEDIA_ROOT
from django.conf import settings

# Import static() to serve media files in development
from django.conf.urls.static import static



# Swagger UI imports
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Health check endpoint for container orchestration
def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'nexshop-api'})

urlpatterns = [
    # =============================================
    # ADMIN
    # =============================================
    path('admin/', admin.site.urls),
    # Health check
    path('api/health/', health_check, name='health_check'),

    # =============================================
    # API ENDPOINTS
    # =============================================

    # Accounts - /api/accounts/
    # - /api/accounts/register/
    # - /api/accounts/login/
    # - /api/accounts/profile/
    # - /api/accounts/logout/
    path('api/accounts/', include('accounts.urls')),
    path('api/auth/', include('accounts.urls')),

    # Products - /api/
    # - /api/products/
    # - /api/products/{slug}/
    # - /api/products/featured/
    # - /api/products/new_arrivals/
    # - /api/products/bestsellers/
    # - /api/products/on_sale/
    # - /api/products/search/?q=
    # - /api/products/{slug}/related/
    # - /api/products/{slug}/images/
    # - /api/categories/
    # - /api/categories/{slug}/
    # - /api/categories/root/
    # - /api/categories/tree/
    # - /api/categories/featured/
    # - /api/categories/{slug}/subcategories/
    # - /api/brands/
    # - /api/brands/{slug}/
    # - /api/brands/featured/
    # - /api/shipping-options/
    # - /api/shipping-options/available/?total=
    path('api/', include('products.urls')),

    # Orders - /api/
    # - /api/orders/
    # - /api/orders/{id}/
    # - /api/cart/
    path('api/', include('orders.urls')),

    # Reviews - /api/
    # - /api/reviews/
    # - /api/products/{slug}/reviews/
    path('api/', include('reviews.urls')),

    # Wishlist - /api/
    # - /api/wishlist/
    path('api/', include('wishlist.urls')),

    # Payments - /api/
    # - /api/payments/
    # - /api/payments/process/
    path('api/', include('payments.urls')),

    # Alerts/Notifications - /api/notifications/
    path('api/notifications/', include('alerts.urls')),

    # Cart - /api/cart/
    path('api/', include('cart.urls')),

    # =============================================
    # API DOCUMENTATION
    # =============================================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

