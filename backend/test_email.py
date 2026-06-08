import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f"Email Backend: {settings.EMAIL_BACKEND}")
print(f"Email Host User: {settings.EMAIL_HOST_USER}")
print(f"Email configured: {'Yes' if settings.EMAIL_HOST_USER else 'No'}")

if settings.EMAIL_HOST_USER:
    try:
        send_mail(
            subject='🎉 NEXSHOP Test Email',
            message='If you receive this, your email configuration is working!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to yourself
            fail_silently=False,
        )
        print("✅ Test email sent successfully! Check your inbox.")
    except Exception as e:
        print(f"❌ Error sending email: {e}")
else:
    print("❌ EMAIL_HOST_USER not configured in .env file")