# restore_images.py
import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')

import django
django.setup()

from products.models import ProductImage, Category

def extract_public_id(url):
    """Extract public_id from Cloudinary URL"""
    if not url:
        return None

    url = str(url)

    # If already a clean public_id (no http)
    if not url.startswith('http') and 'cloudinary' not in url.lower():
        # Clean it up
        url = url.replace('\\', '/').lstrip('/')
        # Remove products/https://res type corruption
        if 'https://' in url or 'http://' in url:
            return None  # Corrupted, need to fix manually
        return url

    # Extract from full Cloudinary URL
    # Pattern: https://res.cloudinary.com/CLOUD/image/upload/vXXX/PUBLIC_ID.ext
    match = re.search(r'/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z]+)?$', url)
    if match:
        public_id = match.group(1)
        return public_id

    return None

def fix_images():
    print("\n🔧 Fixing corrupted image paths...\n")

    # First, let's see what we're dealing with
    print("📋 Current state:")
    print("-" * 60)

    corrupted = []
    ok = []

    for img in ProductImage.objects.all():
        path = str(img.image) if img.image else ''

        if 'https://' in path or 'http://' in path:
            corrupted.append(img)
            print(f"  ❌ ID {img.id}: CORRUPTED - {path[:50]}...")
        elif path and not path.startswith('products/https'):
            ok.append(img)
            print(f"  ✓ ID {img.id}: OK - {path}")
        else:
            corrupted.append(img)
            print(f"  ❌ ID {img.id}: CORRUPTED - {path[:50]}...")

    print(f"\n📊 Summary: {len(ok)} OK, {len(corrupted)} corrupted")

    if corrupted:
        print("\n⚠️  You have corrupted records!")
        print("   We need to restore from your local database.")

if __name__ == '__main__':
    fix_images()