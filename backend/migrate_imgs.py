import os
import django
import cloudinary
import cloudinary.uploader

# ---------------- DJANGO SETUP ----------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nexshop.settings")
django.setup()

from products.models import ProductImage, Category, Brand

# ---------------- CLOUDINARY CONFIG ----------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ---------------- HELPER FUNCTION ----------------
def upload_if_local(image_field, folder):
    """
    Upload image to Cloudinary ONLY if it's local.
    """
    if not image_field:
        return False

    # Already uploaded → skip
    if image_field.url.startswith("http"):
        return False

    local_path = image_field.path
    if not os.path.exists(local_path):
        print(f"⚠️ File missing: {local_path}")
        return False

    result = cloudinary.uploader.upload(
        local_path,
        folder=folder,
        overwrite=False,
        resource_type="image"
    )

    return result["secure_url"]

# ---------------- PRODUCT IMAGES ----------------
print("\n📦 Uploading PRODUCT images...")
for img in ProductImage.objects.all():
    uploaded_url = upload_if_local(img.image, "products")
    if uploaded_url:
        img.image = uploaded_url
        img.save(update_fields=["image"])
        print(f"✅ Uploaded ProductImage ID {img.id}")

# ---------------- CATEGORY IMAGES ----------------
print("\n🗂 Uploading CATEGORY images...")
for category in Category.objects.all():
    uploaded_url = upload_if_local(category.image, "categories")
    if uploaded_url:
        category.image = uploaded_url
        category.save(update_fields=["image"])
        print(f"✅ Uploaded Category ID {category.id}")

# ---------------- BRAND LOGOS ----------------
print("\n🏷 Uploading BRAND logos...")
for brand in Brand.objects.all():
    uploaded_url = upload_if_local(brand.logo, "brands")
    if uploaded_url:
        brand.logo = uploaded_url
        brand.save(update_fields=["logo"])
        print(f"✅ Uploaded Brand ID {brand.id}")

print("\n🎉 Migration complete! Only NEW images were uploaded.")
