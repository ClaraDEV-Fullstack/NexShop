# fix_cloudinary_public_ids_all.py
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')

import django
django.setup()

from products.models import ProductImage, Category

CLOUDINARY_BASE = "https://res.cloudinary.com/dfdw17xrx/image/upload"  # Replace with your Cloud name

def get_public_id(full_url):
    """
    Extract the Cloudinary public ID from a full URL
    """
    if not full_url:
        return None
    if full_url.startswith(CLOUDINARY_BASE):
        return full_url.replace(CLOUDINARY_BASE + "/", "")
    return None

# ----- Fix Product Images -----
print("🔹 Fixing ProductImage fields...")
updated = 0
skipped = 0
for img in ProductImage.objects.all():
    public_id = get_public_id(str(img.image))
    if public_id:
        img.image = public_id
        img.save()
        print(f"✅ ID {img.id} updated -> {public_id}")
        updated += 1
    else:
        skipped += 1

print(f"✅ Done. Updated: {updated}, Skipped: {skipped}")

# ----- Fix Category Images -----
print("\n🔹 Fixing Category image fields...")
updated = 0
skipped = 0
for cat in Category.objects.all():
    public_id = get_public_id(str(cat.image))
    if public_id:
        cat.image = public_id
        cat.save()
        print(f"✅ {cat.name} updated -> {public_id}")
        updated += 1
    else:
        skipped += 1

print(f"✅ Done. Updated: {updated}, Skipped: {skipped}")
