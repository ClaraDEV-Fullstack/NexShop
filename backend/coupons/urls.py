from django.urls import path
from .views import validate_coupon

urlpatterns = [
    path('coupons/validate/', validate_coupon, name='coupon-validate'),
]
