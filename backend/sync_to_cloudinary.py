# sync_to_cloudinary.py
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')

import django
django.setup()

import cloudinary
import cloudinary.uploader
from django.conf import settings
from products.models import ProductImage, Category

cloudinary.config(
    cloud_name=settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
    api_key=settings.CLOUDINARY_STORAGE.get('API_KEY'),
    api_secret=settings.CLOUDINARY_STORAGE.get('API_SECRET'),
)

MEDIA_ROOT = settings.MEDIA_ROOT

def is_cloudinary(path):
    path_str = str(path) if path else ''
    if not path_str:
        return True
    if 'res.cloudinary.com' in path_str:
        return True
    if '/' not in path_str and '\\' not in path_str and not path_str.startswith('products'):
        return True
    return False

def sync_images():
    print(f"\n☁️  CLOUDINARY SYNC")
    print(f"Media: {MEDIA_ROOT}\n")

    uploaded = 0
    skipped = 0

    print("📦 Products:")
    for img in ProductImage.objects.all():
        path = str(img.image) if img.image else ''

        if is_cloudinary(path):
            skipped += 1
            continue

        local = os.path.join(MEDIA_ROOT, path)
        if not os.path.exists(local):
            print(f"  ⚠️ ID {img.id}: Missing file")
            continue

        try:
            result = cloudinary.uploader.upload(local, folder="products")
            img.image = result['public_id']
            img.save()
            print(f"  ✅ ID {img.id}: Uploaded")
            uploaded += 1
        except Exception as e:
            print(f"  ❌ ID {img.id}: {e}")

    print("\n🗂️ Categories:")
    for cat in Category.objects.all():
        if not cat.image:
            continue

        path = str(cat.image)

        if is_cloudinary(path):
            skipped += 1
            continue

        local = os.path.join(MEDIA_ROOT, path)
        if not os.path.exists(local):
            print(f"  ⚠️ {cat.name}: Missing file")
            continue

        try:
            result = cloudinary.uploader.upload(local, folder="categories")
            cat.image = result['public_id']
            cat.save()
            print(f"  ✅ {cat.name}: Uploaded")
            uploaded += 1
        except Exception as e:
            print(f"  ❌ {cat.name}: {e}")

    print(f"\n✅ Uploaded: {uploaded} | ⏭️ Skipped: {skipped}")

if __name__ == '__main__':
    sync_images()