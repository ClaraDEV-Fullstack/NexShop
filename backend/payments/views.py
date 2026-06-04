import hashlib
import hmac
import logging
import json

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Payment
from .serializers import PaymentSerializer, InitPaymentSerializer
from .cinetpay import init_payment, verify_payment
from orders.models import Order
from orders.emails import send_payment_confirmation_email

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(tags=['Payments']),
    retrieve=extend_schema(tags=['Payments']),
)
class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """View payment history for the authenticated user."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    @extend_schema(tags=['Payments'])
    @action(detail=False, methods=['post'], url_path='initiate')
    def initiate(self, request):
        """
        Initiate a CinetPay payment for an order.

        Returns a `payment_url` the frontend should redirect the user to.
        Supports all channels: Visa/Mastercard, Orange Money, MTN MoMo, Wave.
        """
        serializer = InitPaymentSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        channels = serializer.validated_data.get('channels', 'ALL')
        order = Order.objects.get(id=order_id)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        backend_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')

        result = init_payment(
            order=order,
            return_url=f"{frontend_url}/payment/success?order_id={order.id}",
            notify_url=f"{backend_url}/api/payments/webhook/",
            channels=channels,
        )

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                'user': request.user,
                'amount': order.total,
                'currency': getattr(settings, 'CINETPAY_CURRENCY', 'XOF'),
                'transaction_id': result['transaction_id'],
                'payment_url': result['payment_url'],
                'status': 'processing',
            },
        )

        return Response({
            'payment_url': result['payment_url'],
            'transaction_id': result['transaction_id'],
            'reference': payment.reference,
            'order_id': order.id,
        })

    @extend_schema(tags=['Payments'])
    @action(detail=False, methods=['post'], url_path='verify')
    def verify(self, request):
        """Manually verify a payment by transaction ID (called from frontend on return)."""
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'error': 'transaction_id required'}, status=status.HTTP_400_BAD_REQUEST)

        result = verify_payment(transaction_id)
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_502_BAD_GATEWAY)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        if result['accepted'] and payment.status != 'successful':
            _mark_payment_successful(payment)

        return Response(PaymentSerializer(payment).data)

    @extend_schema(tags=['Payments'])
    @action(detail=False, methods=['get'], url_path='order/(?P<order_id>[^/.]+)')
    def get_by_order(self, request, order_id=None):
        """Get payment record for a specific order."""
        try:
            payment = Payment.objects.get(order_id=order_id, user=request.user)
            return Response(PaymentSerializer(payment).data)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class CinetPayWebhookView(APIView):
    """
    Webhook endpoint called by CinetPay after payment completion (IPN).
    CinetPay posts form data; cpm_result='00' means success.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        transaction_id = data.get('cpm_trans_id') or data.get('transaction_id', '')
        result_code = str(data.get('cpm_result', ''))
        trans_status = data.get('cpm_trans_status', '')

        logger.info('CinetPay IPN received: transaction=%s result=%s status=%s',
                    transaction_id, result_code, trans_status)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            logger.warning('CinetPay IPN: unknown transaction_id %s', transaction_id)
            return Response({'status': 'ok'})  # Acknowledge to CinetPay

        if result_code == '00' and trans_status == 'ACCEPTED':
            if payment.status != 'successful':
                _detect_payment_method(payment, data)
                _mark_payment_successful(payment)
        else:
            payment.status = 'failed'
            payment.error_message = data.get('cpm_error_message', f'Declined ({result_code})')
            payment.save(update_fields=['status', 'error_message', 'updated_at'])
            payment.order.payment_status = 'failed'
            payment.order.save(update_fields=['payment_status', 'updated_at'])

        return Response({'status': 'ok'})


def _mark_payment_successful(payment: Payment):
    payment.status = 'successful'
    payment.paid_at = timezone.now()
    payment.save(update_fields=['status', 'paid_at', 'payment_method', 'updated_at'])

    order = payment.order
    order.payment_status = 'paid'
    order.status = 'processing'
    order.save(update_fields=['payment_status', 'status', 'updated_at'])

    try:
        send_payment_confirmation_email(order)
    except Exception as exc:
        logger.error('Failed to send payment confirmation email for order #%s: %s', order.id, exc)


def _detect_payment_method(payment: Payment, ipn_data: dict):
    """Infer payment method from CinetPay IPN data."""
    operator = str(ipn_data.get('payment_method', '') or ipn_data.get('cpm_payment_config', '')).lower()
    if 'orange' in operator:
        payment.payment_method = 'orange_money'
    elif 'mtn' in operator:
        payment.payment_method = 'mtn_money'
    elif 'wave' in operator:
        payment.payment_method = 'wave'
    elif 'moov' in operator:
        payment.payment_method = 'moov'
    elif 'card' in operator or 'visa' in operator or 'master' in operator:
        payment.payment_method = 'card'
    else:
        payment.payment_method = 'mobile_money'
