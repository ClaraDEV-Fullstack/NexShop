import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexshop.settings')
django.setup()

from products.models import Category, Brand, Product, ProductImage, ProductSpecification, ShippingOption

def export_data():
    """Export data from local database"""
    data = {
        'categories': [],
        'brands': [],
        'products': [],
        'images': [],
        'specifications': [],
        'shipping': [],
    }

    # Export categories
    for cat in Category.objects.all():
        data['categories'].append({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'icon': cat.icon,
            'parent_id': cat.parent_id,
            'is_active': cat.is_active,
            'display_order': cat.display_order,
            'featured': cat.featured,
        })

    # Export brands
    for brand in Brand.objects.all():
        data['brands'].append({
            'id': brand.id,
            'name': brand.name,
            'slug': brand.slug,
            'description': brand.description,
            'website': brand.website,
            'is_active': brand.is_active,
            'is_featured': brand.is_featured,
        })

    # Export products
    for prod in Product.objects.all():
        data['products'].append({
            'id': prod.id,
            'name': prod.name,
            'slug': prod.slug,
            'description': prod.description,
            'short_description': prod.short_description,
            'product_type': prod.product_type,
            'price': str(prod.price),
            'compare_price': str(prod.compare_price) if prod.compare_price else None,
            'sku': prod.sku,
            'stock': prod.stock,
            'low_stock_threshold': prod.low_stock_threshold,
            'is_available': prod.is_available,
            'category_id': prod.category_id,
            'brand_id': prod.brand_id,
            'weight': str(prod.weight) if prod.weight else None,
            'dimensions': prod.dimensions,
            'meta_title': prod.meta_title,
            'meta_description': prod.meta_description,
            'featured': prod.featured,
            'is_new': prod.is_new,
            'is_bestseller': prod.is_bestseller,
        })

    # Export images - THIS IS THE IMPORTANT PART
    for img in ProductImage.objects.all():
        image_path = str(img.image) if img.image else None
        data['images'].append({
            'id': img.id,
            'product_id': img.product_id,
            'image': image_path,
            'alt_text': img.alt_text,
            'is_primary': img.is_primary,
            'order': img.order,
        })

    # Export specifications
    for spec in ProductSpecification.objects.all():
        data['specifications'].append({
            'id': spec.id,
            'product_id': spec.product_id,
            'name': spec.name,
            'value': spec.value,
            'order': spec.order,
        })

    # Export shipping options
    for ship in ShippingOption.objects.all():
        data['shipping'].append({
            'id': ship.id,
            'name': ship.name,
            'description': ship.description,
            'price': str(ship.price),
            'estimated_days_min': ship.estimated_days_min,
            'estimated_days_max': ship.estimated_days_max,
            'is_active': ship.is_active,
            'is_default': ship.is_default,
            'free_shipping_threshold': str(ship.free_shipping_threshold) if ship.free_shipping_threshold else None,
            'regions': ship.regions,
            'display_order': ship.display_order,
        })

    print(f"Exported: {len(data['categories'])} categories")
    print(f"Exported: {len(data['brands'])} brands")
    print(f"Exported: {len(data['products'])} products")
    print(f"Exported: {len(data['images'])} images")
    print(f"Exported: {len(data['specifications'])} specifications")
    print(f"Exported: {len(data['shipping'])} shipping options")

    return data


def import_data(data):
    """Import data to Railway database"""
    from decimal import Decimal

    # Clear existing data
    print("Clearing existing data...")
    ProductImage.objects.all().delete()
    ProductSpecification.objects.all().delete()
    Product.objects.all().delete()
    Category.objects.all().delete()
    Brand.objects.all().delete()
    ShippingOption.objects.all().delete()

    # Import categories (parent=None first)
    print("Importing categories...")
    for cat_data in sorted(data['categories'], key=lambda x: (x['parent_id'] or 0)):
        Category.objects.create(
            id=cat_data['id'],
            name=cat_data['name'],
            slug=cat_data['slug'],
            description=cat_data['description'],
            icon=cat_data['icon'],
            parent_id=cat_data['parent_id'],
            is_active=cat_data['is_active'],
            display_order=cat_data['display_order'],
            featured=cat_data['featured'],
        )

    # Import brands
    print("Importing brands...")
    for brand_data in data['brands']:
        Brand.objects.create(
            id=brand_data['id'],
            name=brand_data['name'],
            slug=brand_data['slug'],
            description=brand_data['description'],
            website=brand_data['website'],
            is_active=brand_data['is_active'],
            is_featured=brand_data['is_featured'],
        )

    # Import products
    print("Importing products...")
    for prod_data in data['products']:
        Product.objects.create(
            id=prod_data['id'],
            name=prod_data['name'],
            slug=prod_data['slug'],
            description=prod_data['description'],
            short_description=prod_data['short_description'],
            product_type=prod_data['product_type'],
            price=Decimal(prod_data['price']),
            compare_price=Decimal(prod_data['compare_price']) if prod_data['compare_price'] else None,
            sku=prod_data['sku'],
            stock=prod_data['stock'],
            low_stock_threshold=prod_data['low_stock_threshold'],
            is_available=prod_data['is_available'],
            category_id=prod_data['category_id'],
            brand_id=prod_data['brand_id'],
            weight=Decimal(prod_data['weight']) if prod_data['weight'] else None,
            dimensions=prod_data['dimensions'],
            meta_title=prod_data['meta_title'],
            meta_description=prod_data['meta_description'],
            featured=prod_data['featured'],
            is_new=prod_data['is_new'],
            is_bestseller=prod_data['is_bestseller'],
        )

    # Import images
    print("Importing images...")
    for img_data in data['images']:
        img = ProductImage(
            id=img_data['id'],
            product_id=img_data['product_id'],
            alt_text=img_data['alt_text'],
            is_primary=img_data['is_primary'],
            order=img_data['order'],
        )
        # Set image field directly
        if img_data['image']:
            img.image = img_data['image']
        img.save()

    # Import specifications
    print("Importing specifications...")
    for spec_data in data['specifications']:
        ProductSpecification.objects.create(
            id=spec_data['id'],
            product_id=spec_data['product_id'],
            name=spec_data['name'],
            value=spec_data['value'],
            order=spec_data['order'],
        )

    # Import shipping options
    print("Importing shipping options...")
    for ship_data in data['shipping']:
        ShippingOption.objects.create(
            id=ship_data['id'],
            name=ship_data['name'],
            description=ship_data['description'],
            price=Decimal(ship_data['price']),
            estimated_days_min=ship_data['estimated_days_min'],
            estimated_days_max=ship_data['estimated_days_max'],
            is_active=ship_data['is_active'],
            is_default=ship_data['is_default'],
            free_shipping_threshold=Decimal(ship_data['free_shipping_threshold']) if ship_data['free_shipping_threshold'] else None,
            regions=ship_data['regions'],
            display_order=ship_data['display_order'],
        )

    print("\n✅ Import complete!")
    print(f"Categories: {Category.objects.count()}")
    print(f"Brands: {Brand.objects.count()}")
    print(f"Products: {Product.objects.count()}")
    print(f"Images: {ProductImage.objects.count()}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python migrate_data.py [export|import]")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'export':
        import json
        data = export_data()
        with open('data_backup.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ Data exported to data_backup.json")

    elif command == 'import':
        import json
        with open('data_backup.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        import_data(data)

    else:
        print("Unknown command. Use 'export' or 'import'")