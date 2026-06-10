import logging
import os
import threading

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

PAYMENT_METHOD_LABELS = {
    'orange_money': 'Orange Money',
    'mtn_money': 'MTN Mobile Money',
    'mobile_money': 'Mobile Money',
    'card': 'Card',
}


def _brevo_api_key():
    return os.getenv('BREVO_API_KEY', '')


def _frontend_url():
    return os.getenv('FRONTEND_URL') or getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')


def _default_currency():
    return os.getenv('CINETPAY_CURRENCY') or getattr(settings, 'CINETPAY_CURRENCY', 'XOF')


def _from_email():
    return os.getenv('DEFAULT_FROM_EMAIL') or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexshop.com')


def _from_name():
    return os.getenv('DEFAULT_FROM_NAME', 'NEXSHOP')


def format_amount(amount, currency=None):
    currency = currency or _default_currency()
    return f"{amount:,.0f} {currency}"


def _uses_real_email_provider() -> bool:
    if _brevo_api_key() and not _brevo_api_key().startswith('xsmtpsib-'):
        return True
    backend = getattr(settings, 'EMAIL_BACKEND', '')
    return bool(os.getenv('EMAIL_HOST_USER')) and 'console' not in backend


def send_email(subject, text_content, html_content, recipient_email) -> bool:
    """
    Send a transactional email.

    Priority: Brevo API → Django SMTP backend.
    Returns True only when sent via a real provider (inbox delivery).
    Console backend logs the message in dev but returns False.
    """
    if not recipient_email:
        logger.warning('Cannot send email: recipient address is empty')
        return False

    brevo_key = _brevo_api_key()
    if brevo_key and not brevo_key.startswith('xsmtpsib-'):
        payload = {
            'sender': {'name': _from_name(), 'email': _from_email()},
            'to': [{'email': recipient_email}],
            'subject': subject,
            'htmlContent': html_content,
            'textContent': text_content,
        }
        headers = {
            'api-key': brevo_key,
            'Content-Type': 'application/json',
        }
        try:
            response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            logger.info('Email sent to %s via Brevo', recipient_email)
            return True
        except Exception as exc:
            logger.error('Brevo email failed for %s: %s', recipient_email, exc)

    try:
        from django.core.mail import EmailMultiAlternatives

        message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=_from_email(),
            to=[recipient_email],
        )
        message.attach_alternative(html_content, 'text/html')
        message.send(fail_silently=False)

        backend = getattr(settings, 'EMAIL_BACKEND', 'unknown')
        if 'console' in backend:
            logger.info(
                'Payment/order email logged to console only (configure BREVO_API_KEY or EMAIL_HOST_USER for inbox delivery): %s',
                recipient_email,
            )
            return False

        logger.info('Email sent to %s via %s', recipient_email, backend)
        return True
    except Exception as exc:
        logger.error('Email delivery failed for %s: %s', recipient_email, exc)
        return False


def send_email_async(subject, text_content, html_content, recipient_email):
    """Fire-and-forget wrapper for non-critical emails."""

    def _run():
        try:
            send_email(subject, text_content, html_content, recipient_email)
        finally:
            from django.db import close_old_connections
            close_old_connections()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return True


def send_order_confirmation_email(order):
    """Send order confirmation email."""
    user_name = order.user.first_name or order.user.username or 'Customer'
    user_email = order.user.email
    is_paid = order.payment_status == 'paid'
    total_display = format_amount(order.total)
    frontend_url = _frontend_url()

    text_content = f"""
Order Confirmed - #{order.id}

Hi {user_name}!

Thank you for your order!

Order Number: #{order.id}
Total: {total_display}
Status: {order.get_status_display()}
Payment: {'Paid' if is_paid else 'Awaiting Payment'}

View your order: {frontend_url}/orders/{order.id}

Thank you for shopping with NEXSHOP!
"""

    items_html = ''
    for item in order.items.all():
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{format_amount(item.get_subtotal())}</td>
        </tr>
        """

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="background: white; padding: 30px;">
            <h2>Hi {user_name}!</h2>
            <p>Thank you for your order!</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order #:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.get_status_display()}</p>
                <p><strong>Payment:</strong> {'Paid' if is_paid else 'Awaiting Payment'}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left;">Item</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>{items_html}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 12px; text-align: right; color: #3b82f6; font-size: 20px;"><strong>{total_display}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/orders/{order.id}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Order</a>
            </div>
        </div>
    </div>
</body>
</html>
"""

    return send_email_async(
        f'Order Confirmation - #{order.id} | NEXSHOP',
        text_content,
        html_content,
        user_email,
    )


def send_payment_confirmation_email(order, payment=None) -> bool:
    """Send payment confirmation email after successful payment. Returns delivery status."""
    user_name = order.user.first_name or order.user.username or 'Customer'
    user_email = order.user.email
    currency = getattr(payment, 'currency', None) or _default_currency()
    total_display = format_amount(order.total, currency)
    method_label = PAYMENT_METHOD_LABELS.get(
        getattr(payment, 'payment_method', None), 'Mobile Money'
    )
    frontend_url = _frontend_url()
    phone_line = ''
    if payment and payment.payer_phone:
        phone_line = f"\nPaid from: {payment.payer_phone} ({method_label})"

    text_content = f"""
Payment Confirmed - Order #{order.id}

Hi {user_name}!

Your payment of {total_display} has been received via {method_label}!{phone_line}

Order Number: #{order.id}
Amount: {total_display}
Status: Processing

Track your order: {frontend_url}/orders/{order.id}

Thank you for shopping with NEXSHOP!
"""

    method_html = f'<p><strong>Method:</strong> {method_label}</p>' if payment else ''
    phone_html = f'<p><strong>Phone:</strong> {payment.payer_phone}</p>' if payment and payment.payer_phone else ''

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 10px 0 0 0;">Payment Confirmed!</h1>
        </div>
        <div style="background: white; padding: 30px; text-align: center;">
            <h2>Thank you, {user_name}!</h2>
            <div style="background: #ecfdf5; padding: 30px; border-radius: 12px; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0;">Amount Paid</p>
                <p style="color: #059669; font-size: 36px; font-weight: bold; margin: 10px 0;">{total_display}</p>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: left;">
                <p><strong>Order #:</strong> {order.id}</p>
                {method_html}
                {phone_html}
                <p><strong>Status:</strong> {order.get_status_display()}</p>
                <p><strong>Payment:</strong> <span style="color: #059669;">Paid</span></p>
            </div>
            <div style="margin: 30px 0;">
                <a href="{frontend_url}/orders/{order.id}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Track Order</a>
            </div>
        </div>
    </div>
</body>
</html>
"""

    return send_email(
        f'Payment Confirmed - Order #{order.id} | NEXSHOP',
        text_content,
        html_content,
        user_email,
    )


def send_payment_confirmation_email_async(order, payment=None) -> bool:
    """Queue payment confirmation email so checkout API responds immediately."""

    def _run():
        try:
            send_payment_confirmation_email(order, payment)
        finally:
            from django.db import close_old_connections
            close_old_connections()

    threading.Thread(target=_run, daemon=True).start()
    return _uses_real_email_provider()
