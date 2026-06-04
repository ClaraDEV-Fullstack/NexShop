from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import Coupon
from .serializers import CouponValidateSerializer


@extend_schema(tags=['Coupons'])
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_coupon(request):
    """
    Validate a coupon code against a given subtotal.
    Returns discount amount if valid.
    """
    serializer = CouponValidateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    coupon = serializer.get_coupon()
    subtotal = serializer.validated_data['subtotal']
    discount = coupon.calculate_discount(subtotal)

    return Response({
        'code': coupon.code,
        'discount_type': coupon.discount_type,
        'discount_value': coupon.discount_value,
        'discount_amount': discount,
        'description': coupon.description,
    })
