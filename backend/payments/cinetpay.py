"""
CinetPay payment gateway client.

Supports: Visa/Mastercard, Orange Money, MTN Mobile Money, Wave, Moov Money
API docs: https://docs.cinetpay.com/
"""
import uuid
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

CINETPAY_API_URL = 'https://api-checkout.cinetpay.com/v2/payment'
CINETPAY_CHECK_URL = 'https://api-checkout.cinetpay.com/v2/payment/check'


def _api_key():
    return getattr(settings, 'CINETPAY_API_KEY', '')


def _site_id():
    return getattr(settings, 'CINETPAY_SITE_ID', '')


def init_payment(order, return_url: str, notify_url: str, channels: str = 'ALL') -> dict:
    """
    Initialise a CinetPay payment and return the redirect URL.

    channels options:
      'ALL'          – all available (card + mobile money)
      'MOBILE_MONEY' – Orange Money, MTN MoMo, Wave, Moov only
      'CREDIT_CARD'  – Visa / Mastercard only

    Returns:
        {'success': True, 'payment_url': '...', 'transaction_id': '...'}
        {'success': False, 'error': '...'}
    """
    transaction_id = f"NSS-{order.id}-{uuid.uuid4().hex[:8].upper()}"
    user = order.user

    payload = {
        'apikey': _api_key(),
        'site_id': _site_id(),
        'transaction_id': transaction_id,
        'amount': int(order.total),          # CinetPay requires integer
        'currency': getattr(settings, 'CINETPAY_CURRENCY', 'XOF'),
        'description': f'Order #{order.id} — NextShopSphere',
        'notify_url': notify_url,
        'return_url': return_url,
        'channels': channels,
        'lang': 'fr',
        # Customer details (required for card payments)
        'customer_name': user.first_name or user.username,
        'customer_surname': user.last_name or '',
        'customer_email': user.email,
        'customer_phone_number': getattr(user, 'phone', '') or '',
        'customer_address': order.shipping_address,
        'customer_city': order.shipping_city,
        'customer_country': order.shipping_country[:2].upper() if order.shipping_country else 'CI',
        'customer_state': order.shipping_country[:2].upper() if order.shipping_country else 'CI',
        'customer_zip': '00000',
    }

    try:
        resp = requests.post(CINETPAY_API_URL, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        logger.error('CinetPay init_payment network error: %s', exc)
        return {'success': False, 'error': str(exc)}

    if data.get('code') in ('201', 201):
        return {
            'success': True,
            'payment_url': data['data']['payment_url'],
            'transaction_id': transaction_id,
        }

    logger.warning('CinetPay init_payment rejected: %s', data)
    return {'success': False, 'error': data.get('message', 'Payment initialisation failed')}


def verify_payment(transaction_id: str) -> dict:
    """
    Verify a payment by its transaction ID.

    Returns:
        {'success': True, 'status': 'ACCEPTED'|'REFUSED'|..., 'data': {...}}
        {'success': False, 'error': '...'}
    """
    payload = {
        'apikey': _api_key(),
        'site_id': _site_id(),
        'transaction_id': transaction_id,
    }

    try:
        resp = requests.post(CINETPAY_CHECK_URL, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        logger.error('CinetPay verify_payment network error: %s', exc)
        return {'success': False, 'error': str(exc)}

    if data.get('code') in ('00', '0', 0, '200', 200):
        payment_data = data.get('data', {})
        trans_status = payment_data.get('status', '')
        return {
            'success': True,
            'accepted': trans_status == 'ACCEPTED',
            'status': trans_status,
            'data': payment_data,
        }

    return {'success': False, 'error': data.get('message', 'Verification failed')}
