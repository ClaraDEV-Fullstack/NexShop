# fix_order_images.py

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')
django.setup()

from orders.models import OrderItem
from products.models import Product, ProductImage


def fix_order_images():
    """Update order items with correct Cloudinary image URLs from products"""

    updated_count = 0

    # Get all order items
    order_items = OrderItem.objects.all()

    print(f"Found {order_items.count()} order items to check...")

    for item in order_items:
        # Try to find the product
        try:
            product = Product.objects.get(id=item.product_id)
        except Product.DoesNotExist:
            # Try by slug if product_id doesn't work
            try:
                product = Product.objects.get(slug=item.product_slug)
            except Product.DoesNotExist:
                print(f"  ⚠️ Product not found for order item {item.id} (product_id: {item.product_id})")
                continue

        # Get the primary image
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()

        if primary_image and primary_image.image:
            # Get the image URL
            image_url = str(primary_image.image)

            # Check if it's different from current
            current_image = item.product_image or ""

            if image_url != current_image:
                print(f"  ✅ Updating: {item.product_name}")
                print(f"     Old: {current_image[:60]}...")
                print(f"     New: {image_url[:60]}...")

                item.product_image = image_url
                item.save()
                updated_count += 1

    print(f"\n✅ Updated {updated_count} order items with Cloudinary URLs!")


if __name__ == '__main__':
    fix_order_images()