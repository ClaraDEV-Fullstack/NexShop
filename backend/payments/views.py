import logging

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from alerts.services import notify_user, frontend_link
from .models import Payment
from .serializers import PaymentSerializer, InitPaymentSerializer
from .cinetpay import init_payment, verify_payment, is_mock_mode
from orders.models import Order
from orders.emails import send_payment_confirmation_email

logger = logging.getLogger(__name__)

PAYMENT_METHOD_LABELS = {
    'orange_money': 'Orange Money',
    'mtn_money': 'MTN Mobile Money',
}


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
    @action(detail=False, methods=['get'], url_path='config', permission_classes=[permissions.AllowAny])
    def config(self, request):
        """Public payment configuration."""
        return Response({
            'payment_mode': 'mock' if is_mock_mode() else 'live',
            'currency': getattr(settings, 'CINETPAY_CURRENCY', 'XOF'),
            'providers': [
                {'id': 'orange_money', 'label': 'Orange Money'},
                {'id': 'mtn_money', 'label': 'MTN Mobile Money'},
            ],
        })

    @extend_schema(tags=['Payments'])
    @action(detail=False, methods=['post'], url_path='initiate')
    def initiate(self, request):
        """
        Process a mobile money payment (Orange Money or MTN MoMo).

        In mock/portfolio mode, completes instantly and returns payment details
        for an on-page success modal. In live mode, returns a CinetPay redirect URL.
        """
        serializer = InitPaymentSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        payment_method = serializer.validated_data['payment_method']
        phone_number = serializer.validated_data['phone_number']
        payer_name = serializer.validated_data.get('payer_name', '').strip()
        order = Order.objects.get(id=order_id)

        if not payer_name:
            payer_name = (
                f"{request.user.first_name} {request.user.last_name}".strip()
                or request.user.username
            )

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        backend_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')
        currency = getattr(settings, 'CINETPAY_CURRENCY', 'XOF')

        result = init_payment(
            order=order,
            return_url=f"{frontend_url}/payment/success?order_id={order.id}",
            notify_url=f"{backend_url}/api/payments/webhook/",
            channels='MOBILE_MONEY',
            payment_method=payment_method,
            payer_name=payer_name,
            phone_number=phone_number,
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
                'currency': currency,
                'transaction_id': result['transaction_id'],
                'payment_url': result.get('payment_url'),
                'payment_method': payment_method,
                'payer_name': payer_name,
                'payer_phone': phone_number,
                'status': 'processing',
            },
        )

        if result.get('mock'):
            email_sent = _mark_payment_successful(payment)
        else:
            email_sent = False

        response_data = {
            'success': True,
            'order_id': order.id,
            'amount': str(order.total),
            'currency': currency,
            'transaction_id': result['transaction_id'],
            'reference': payment.reference,
            'payment_method': payment_method,
            'payment_method_label': PAYMENT_METHOD_LABELS.get(payment_method, payment_method),
            'mock': bool(result.get('mock')),
            'email_sent': email_sent,
        }

        if result.get('payment_url') and not result.get('mock'):
            response_data['payment_url'] = result['payment_url']

        return Response(response_data)

    @extend_schema(tags=['Payments'])
    @action(detail=False, methods=['post'], url_path='verify')
    def verify(self, request):
        """Manually verify a payment by transaction ID."""
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
    """Webhook endpoint called by CinetPay after payment completion (IPN)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        transaction_id = data.get('cpm_trans_id') or data.get('transaction_id', '')
        result_code = str(data.get('cpm_result', ''))
        trans_status = data.get('cpm_trans_status', '')

        logger.info(
            'CinetPay IPN received: transaction=%s result=%s status=%s',
            transaction_id, result_code, trans_status,
        )

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            logger.warning('CinetPay IPN: unknown transaction_id %s', transaction_id)
            return Response({'status': 'ok'})

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
            _notify_payment_failed(payment)

        return Response({'status': 'ok'})


def _mark_payment_successful(payment: Payment) -> bool:
    payment.status = 'successful'
    payment.paid_at = timezone.now()
    payment.save(update_fields=['status', 'paid_at', 'payment_method', 'updated_at'])

    order = payment.order
    order.payment_status = 'paid'
    order.status = 'processing'
    order.save(update_fields=['payment_status', 'status', 'updated_at'])

    email_sent = False
    try:
        email_sent = send_payment_confirmation_email(order, payment=payment)
    except Exception as exc:
        logger.error('Failed to send payment confirmation email for order #%s: %s', order.id, exc)

    method_label = PAYMENT_METHOD_LABELS.get(payment.payment_method, 'Mobile Money')
    notify_user(
        payment.user,
        'payment',
        f'Payment confirmed — Order #{order.id}',
        f'Your {method_label} payment of {order.total} {payment.currency} was successful.',
        frontend_link(f'/orders/{order.id}'),
    )
    return email_sent


def _notify_payment_failed(payment: Payment):
    order = payment.order
    notify_user(
        payment.user,
        'payment',
        f'Payment failed — Order #{order.id}',
        payment.error_message or 'Your payment could not be processed. Please try again.',
        frontend_link(f'/payment/{order.id}'),
    )


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
