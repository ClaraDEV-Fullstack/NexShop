import os
import django
import cloudinary.uploader

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')
django.setup()

from products.models import ProductImage, Product, Category, Brand

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# ---------- UPLOAD PRODUCT IMAGES ----------
print("Uploading product images...")
for img in ProductImage.objects.all():
    if img.image and not img.image.url.startswith("http"):
        result = cloudinary.uploader.upload(img.image.path)
        img.image = result['secure_url']
        img.save()
        print(f"✅ Uploaded: {img} -> {img.image}")

# ---------- UPLOAD CATEGORY IMAGES ----------
print("\nUploading category images...")
for category in Category.objects.all():
    if category.image and not category.image.url.startswith("http"):
        result = cloudinary.uploader.upload(category.image.path)
        category.image = result['secure_url']
        category.save()
        print(f"✅ Uploaded: {category} -> {category.image}")

# ---------- UPLOAD BRAND LOGOS ----------
print("\nUploading brand logos...")
for brand in Brand.objects.all():
    if brand.logo and not brand.logo.url.startswith("http"):
        result = cloudinary.uploader.upload(brand.logo.path)
        brand.logo = result['secure_url']
        brand.save()
        print(f"✅ Uploaded: {brand} -> {brand.logo}")

print("\nAll images uploaded successfully!")
