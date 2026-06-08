# backend/ensure_superuser.py

import os
import django

# ---------------- Setup Django ----------------
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# ---------------- Superuser credentials ----------------
SUPERUSER_EMAIL = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'claraberi63@gmail.com')
SUPERUSER_USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'clara')
SUPERUSER_PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'cla19980')

try:
    # Check if a user with this email already exists
    user = User.objects.get(email=SUPERUSER_EMAIL)

    # Update password and superuser/staff privileges
    user.set_password(SUPERUSER_PASSWORD)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"✅ Existing user '{user.username}' found. Password reset and superuser privileges granted.")

except User.DoesNotExist:
    # Create a new superuser
    user = User.objects.create_superuser(
        username=SUPERUSER_USERNAME,
        email=SUPERUSER_EMAIL,
        password=SUPERUSER_PASSWORD
    )
    print(f"✅ Superuser '{user.username}' created successfully!")
