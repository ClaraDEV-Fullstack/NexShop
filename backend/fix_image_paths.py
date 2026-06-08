# fix_image_paths.py
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')

import django
django.setup()

from products.models import ProductImage, Category

def fix_cloudinary_paths():
    print("\n🔧 Fixing corrupted Cloudinary paths...\n")

    fixed_count = 0

    for img in ProductImage.objects.all():
        if img.image and 'res.cloudinary.com' in str(img.image):
            old_path = str(img.image)

            if 'image/upload/' in old_path:
                parts = old_path.split('image/upload/')
                if len(parts) > 1:
                    path_part = parts[-1]
                    if path_part.startswith('v') and '/' in path_part:
                        path_part = path_part.split('/', 1)[-1]

                    new_path = path_part.replace('\\', '/').lstrip('/')

                    print(f"  📸 ID {img.id}: {new_path}")
                    img.image = new_path
                    img.save()
                    fixed_count += 1

    for cat in Category.objects.all():
        if cat.image and 'res.cloudinary.com' in str(cat.image):
            old_path = str(cat.image)

            if 'image/upload/' in old_path:
                parts = old_path.split('image/upload/')
                if len(parts) > 1:
                    path_part = parts[-1]
                    if path_part.startswith('v') and '/' in path_part:
                        path_part = path_part.split('/', 1)[-1]

                    new_path = path_part.replace('\\', '/').lstrip('/')

                    print(f"  📁 {cat.name}: {new_path}")
                    cat.image = new_path
                    cat.save()
                    fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} paths")

if __name__ == '__main__':
    fix_cloudinary_paths()