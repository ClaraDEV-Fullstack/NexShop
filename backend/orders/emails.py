import threading
import logging
import os
import requests

logger = logging.getLogger(__name__)

# Environment variables - FIXED
BREVO_API_KEY = os.getenv("BREVO_API_KEY")  # Set in Render environment
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "claraberi63@gmail.com")
DEFAULT_FROM_NAME = os.getenv("DEFAULT_FROM_NAME", "NEXSHOP")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nexshop-ui.onrender.com")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email_async(subject, text_content, html_content, recipient_email):
    """Send email via Brevo API asynchronously"""
    def send():
        if not BREVO_API_KEY:
            logger.warning("⚠️ BREVO_API_KEY not set - skipping email")
            return

        payload = {
            "sender": {"name": DEFAULT_FROM_NAME, "email": DEFAULT_FROM_EMAIL},
            "to": [{"email": recipient_email}],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content,
        }
        headers = {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(BREVO_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            logger.info(f"✅ Email sent to {recipient_email}")
        except Exception as e:
            logger.error(f"❌ Failed to send email to {recipient_email}: {e}")

    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
    return True


def send_order_confirmation_email(order):
    """Send order confirmation email via Brevo API"""
    user_name = order.user.first_name or order.user.username or "Customer"
    user_email = order.user.email
    is_paid = order.payment_status == "paid"

    text_content = f"""
Order Confirmed - #{order.id}

Hi {user_name}!

Thank you for your order!

Order Number: #{order.id}
Total: ${order.total:,.2f}
Status: {order.get_status_display()}
Payment: {'Paid' if is_paid else 'Awaiting Payment'}

View your order: {FRONTEND_URL}/orders/{order.id}

Thank you for shopping with NEXSHOP!
"""

    items_html = ""
    for item in order.items.all():
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.get_subtotal():,.2f}</td>
        </tr>
        """

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🛍️ Order Confirmed!</h1>
        </div>
        <div style="background: white; padding: 30px;">
            <h2>Hi {user_name}! 👋</h2>
            <p>Thank you for your order!</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order #:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.get_status_display()}</p>
                <p><strong>Payment:</strong> {'✅ Paid' if is_paid else '⏳ Awaiting Payment'}</p>
            </div>
            
            <h3>Order Items</h3>
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
                        <td style="padding: 12px; text-align: right; color: #3b82f6; font-size: 20px;"><strong>${order.total:,.2f}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}/orders/{order.id}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Order →</a>
            </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; margin: 0;">© 2025 NEXSHOP</p>
        </div>
    </div>
</body>
</html>
"""

    return send_email_async(
        f"🛍️ Order Confirmation - #{order.id} | NEXSHOP",
        text_content,
        html_content,
        user_email
    )


def send_payment_confirmation_email(order):
    """Send payment confirmation email via Brevo API"""
    user_name = order.user.first_name or order.user.username or "Customer"
    user_email = order.user.email

    text_content = f"""
Payment Confirmed - Order #{order.id}

Hi {user_name}!

Your payment of ${order.total:,.2f} has been received!

Order Number: #{order.id}
Amount: ${order.total:,.2f}
Status: Processing

Track your order: {FRONTEND_URL}/orders/{order.id}

Thank you for shopping with NEXSHOP!
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <div style="font-size: 50px;">✅</div>
            <h1 style="color: white; margin: 10px 0 0 0;">Payment Confirmed!</h1>
        </div>
        <div style="background: white; padding: 30px; text-align: center;">
            <h2>Thank you, {user_name}!</h2>
            
            <div style="background: #ecfdf5; padding: 30px; border-radius: 12px; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0;">Amount Paid</p>
                <p style="color: #059669; font-size: 36px; font-weight: bold; margin: 10px 0;">${order.total:,.2f}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: left;">
                <p><strong>Order #:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.get_status_display()}</p>
                <p><strong>Payment:</strong> <span style="color: #059669;">✅ Paid</span></p>
            </div>
            
            <div style="margin: 30px 0;">
                <a href="{FRONTEND_URL}/orders/{order.id}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Track Order →</a>
            </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; margin: 0;">© 2025 NEXSHOP</p>
        </div>
    </div>
</body>
</html>
"""

    return send_email_async(
        f"💳 Payment Confirmed - Order #{order.id} | NEXSHOP",
        text_content,
        html_content,
        user_email
    )