from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils.text import slugify
from decimal import Decimal
import io, time, requests, os

from products.models import (
    Category,
    Brand,
    Product,
    ProductSpecification,
    ShippingOption,
    ProductImage
)


class Command(BaseCommand):
    help = "Seed complete e-commerce data with real-world products"

    # ── Unsplash photo IDs per product slug (2-3 shots each) ──────────────
    PRODUCT_PHOTOS = {
        "apple-iphone-15-pro-max-256gb-natural-titanium":   ["photo-1592750475338-74b7b21085ab","photo-1510557880182-3d4d3cba35a5"],
        "samsung-galaxy-s24-ultra-512gb-titanium-black":    ["photo-1610945415295-d9bbf067e59c","photo-1565849904461-04a58ad377e0"],
        "sony-wh-1000xm5-wireless-noise-cancelling":        ["photo-1505740420928-5e560c06d30e","photo-1484704849700-f032a568e944"],
        "apple-macbook-pro-14-m3-pro-space-black":          ["photo-1517336714731-489689fd1ca8","photo-1611186871525-b9e028614f3c"],
        "apple-ipad-pro-12-9-m2-256gb-space-gray":          ["photo-1544244015-0df4b3ffc6b0","photo-1623126908029-58cb08a2b272"],
        "nike-air-jordan-1-retro-high-og-chicago":          ["photo-1542291026-7eec264c27ff","photo-1595950653106-6c9ebd614d3a"],
        "levis-501-original-fit-mens-jeans-stonewash":      ["photo-1541099649105-f69ad21f3246","photo-1475178626620-a4d074967452"],
        "ray-ban-aviator-classic-sunglasses-gold-green":    ["photo-1572635196237-14b3f281503f","photo-1511499767150-a48a237f0083"],
        "adidas-ultraboost-23-running-shoes-core-black":    ["photo-1608231387042-66d1773070a5","photo-1539185441755-769473a23570"],
        "ralph-lauren-classic-fit-mesh-polo-navy":          ["photo-1596755094514-f87e34085b2c","photo-1503341733017-1901578f9f1e"],
        "dyson-v15-detect-absolute-cordless-vacuum":        ["photo-1558618047-3c8c76ca7d13","photo-1581578731548-c64695cc6952"],
        "ikea-malm-queen-bed-frame-storage-white-oak":      ["photo-1555041469-a586c61ea9bc","photo-1631049307264-da0ec9d70304"],
        "philips-hue-white-color-ambiance-starter-kit":     ["photo-1507473885765-e6ed057f782c","photo-1513506003901-1e6a18a9e32c"],
        "le-creuset-signature-dutch-oven-5-5-qt-flame":     ["photo-1585515320310-259814833e62","photo-1556909114-f6e7ad7d3136"],
        "nespresso-vertuo-next-premium-coffee-machine":     ["photo-1495474472287-4d71bcdd2085","photo-1514432324607-a09d9b4aefdd"],
        "cerave-hydrating-facial-cleanser-473ml":           ["photo-1556228720-195a672e8a03","photo-1571781926291-c477ebfd024b"],
        "the-ordinary-niacinamide-zinc-serum-30ml":         ["photo-1620916566398-39f1143ab7be","photo-1556228720-195a672e8a03"],
        "drunk-elephant-protini-polypeptide-cream":         ["photo-1608248543803-ba4f8c70ae0b","photo-1522335789203-aabd1fc54bc9"],
        "fenty-beauty-pro-filtr-foundation":                ["photo-1596462502278-27bfdc403348","photo-1522335789203-aabd1fc54bc9"],
        "estee-lauder-advanced-night-repair-serum":         ["photo-1571781926291-c477ebfd024b","photo-1608248543803-ba4f8c70ae0b"],
        "atomic-habits-james-clear-hardcover":              ["photo-1512820790803-83ca734da794","photo-1544716278-ca5e3f4abd8c"],
        "python-crash-course-3rd-edition":                  ["photo-1461749280684-dccba630e2f6","photo-1516116216624-53e697fedbea"],
        "psychology-of-money-morgan-housel":                ["photo-1589829085413-56de8ae18c73","photo-1495446815901-a7297e633e8d"],
        "clean-code-robert-martin":                         ["photo-1517842645767-c639042777db","photo-1516116216624-53e697fedbea"],
        "sapiens-brief-history-humankind":                  ["photo-1507003211169-0a1dd7228f2d","photo-1512820790803-83ca734da794"],
        "peloton-bike-plus-indoor-exercise":                ["photo-1534438327276-14e5300c3a48","photo-1571019613454-1cb2f99b2d8b"],
        "bowflex-selecttech-552-adjustable-dumbbells":      ["photo-1583454110551-21f2fa2afe61","photo-1534438327276-14e5300c3a48"],
        "theragun-pro-percussive-therapy-device":           ["photo-1517344884509-a0c97ec11bcc","photo-1571019613454-1cb2f99b2d8b"],
        "garmin-forerunner-965-gps-running-watch":          ["photo-1523275335684-37898b6baf30","photo-1434493789847-2f02dc6ca35d"],
        "manduka-pro-yoga-mat-6mm-black":                   ["photo-1601925260368-ae2f83cf8b7f","photo-1544367567-0f2fcb009e0b"],
        "lego-star-wars-millennium-falcon-75375":           ["photo-1558618666-fcd25c85cd64","photo-1587654780291-39c9404d746b"],
        "nintendo-switch-oled-model-white":                 ["photo-1578303512597-81e6cc155b3e","photo-1585620385456-4759f9b5c7d9"],
        "barbie-dreamhouse-2023-edition":                   ["photo-1515488042361-ee00e0ddd4e4","photo-1545558014-8692077e9b5c"],
        "melissa-doug-wooden-building-blocks-100":          ["photo-1515488042361-ee00e0ddd4e4","photo-1558618666-fcd25c85cd64"],
        "hasbro-monopoly-classic-board-game":               ["photo-1611996575749-79a3a250f948","photo-1585620385456-4759f9b5c7d9"],
        "complete-web-development-bootcamp-2024":           ["photo-1461749280684-dccba630e2f6","photo-1516116216624-53e697fedbea"],
        "adobe-creative-cloud-all-apps-1-year":             ["photo-1558655146-9f40138edfeb","photo-1611532736597-de2d4265fba3"],
        "microsoft-365-family-1-year":                      ["photo-1517842645767-c639042777db","photo-1496181133206-80ce9b88a853"],
        "spotify-premium-12-month-gift-card":               ["photo-1614680376573-df3480f0c6ff","photo-1611339555312-e607c8352fd7"],
        "canva-pro-annual-subscription":                    ["photo-1611532736597-de2d4265fba3","photo-1558655146-9f40138edfeb"],
    }

    def _download(self, photo_id):
        url = f"https://images.unsplash.com/{photo_id}?w=900&q=85&auto=format&fit=crop"
        try:
            r = requests.get(url, timeout=25)
            r.raise_for_status()
            return io.BytesIO(r.content)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"      ⚠ Could not download {photo_id}: {e}"))
            return None

    def _direct_upload(self, path: str, data: bytes) -> bool:
        """Upload bytes directly to Supabase via REST API — reliable for large images."""
        from django.conf import settings
        supabase_url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_KEY
        bucket = settings.SUPABASE_BUCKET
        upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{path}"
        try:
            resp = requests.post(
                upload_url, data=data,
                headers={
                    'Authorization': f'Bearer {key}',
                    'apikey': key,
                    'Content-Type': 'image/jpeg',
                    'x-upsert': 'true',
                },
                timeout=30,
            )
            if resp.status_code not in (200, 201):
                self.stdout.write(self.style.WARNING(f"      ⚠ Upload failed ({resp.status_code}): {resp.text[:80]}"))
                return False
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"      ⚠ Upload error: {e}"))
            return False

    def seed_placeholder_images(self):
        self.stdout.write("\n📸  Downloading & uploading product images to Supabase…\n")
        uploaded = 0
        for product in Product.objects.all():
            if product.images.exists():
                self.stdout.write(f"   ⏭  {product.name[:55]} — already has images")
                continue

            photo_ids = self.PRODUCT_PHOTOS.get(product.slug, [])
            if not photo_ids:
                self.stdout.write(self.style.WARNING(f"   ⚠  No photos mapped for: {product.slug}"))
                continue

            self.stdout.write(f"   🖼  {product.name[:55]}")
            for idx, pid in enumerate(photo_ids):
                raw = self._download(pid)
                if not raw:
                    continue
                fname = f"products/{product.slug}-{idx+1}.jpg"
                # Upload directly via Supabase REST (bypasses Django storage layer issues)
                ok = self._direct_upload(fname, raw.read())
                if not ok:
                    continue
                ProductImage.objects.create(
                    product=product,
                    image=fname,
                    alt_text=product.name,
                    is_primary=(idx == 0),
                    order=idx,
                )
                uploaded += 1
                self.stdout.write(f"      ✓ uploaded image {idx+1}")
                time.sleep(0.2)

        self.stdout.write(self.style.SUCCESS(f"\n✅  Images uploaded: {uploaded}"))

    # -------------------------------
    # MAIN HANDLER
    # -------------------------------
    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Wipe existing products first")

    def handle(self, *args, **options):
        if options.get("clear"):
            self.stdout.write(self.style.WARNING("🗑️  Clearing existing product data..."))
            self.clear_existing_data()

        self.stdout.write(
            self.style.HTTP_INFO("\n🚀 Starting comprehensive product seeding...\n")
        )

        brands = self.create_brands()
        categories = self.create_categories()
        self.create_shipping_options()

        self.seed_electronics(categories['electronics'], brands)
        self.seed_fashion(categories['fashion'], brands)
        self.seed_home_living(categories['home'], brands)
        self.seed_beauty(categories['beauty'], brands)
        self.seed_books(categories['books'], brands)
        self.seed_sports(categories['sports'], brands)
        self.seed_kids_toys(categories['kids'], brands)
        self.seed_digital(categories['digital'], brands)

        # 🔑 THIS IS THE FIX YOU WERE MISSING
        self.seed_placeholder_images()

        self.print_summary()

    # -------------------------------
    # CLEAR DATA
    # -------------------------------
    def clear_existing_data(self):
        ProductSpecification.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Brand.objects.all().delete()
        ShippingOption.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("✓ Cleared existing data"))


    # ═══════════════════════════════════════════════════════════════
    # BRANDS
    # ═══════════════════════════════════════════════════════════════
    def create_brands(self):
        self.stdout.write("📦 Creating brands...")

        brand_data = [
            # Electronics
            {"name": "Apple", "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.", "website": "https://www.apple.com"},
            {"name": "Samsung", "description": "Samsung Electronics is a global leader in technology, opening new possibilities for people everywhere.", "website": "https://www.samsung.com"},
            {"name": "Sony", "description": "Sony Corporation is a Japanese multinational conglomerate known for electronics, gaming, and entertainment.", "website": "https://www.sony.com"},
            {"name": "Dell", "description": "Dell Technologies provides computers, servers, data storage devices, and software.", "website": "https://www.dell.com"},
            {"name": "Bose", "description": "Bose Corporation sells audio equipment including premium headphones and speakers.", "website": "https://www.bose.com"},

            # Fashion
            {"name": "Nike", "description": "Nike designs, develops, manufactures, and markets footwear, apparel, and accessories.", "website": "https://www.nike.com"},
            {"name": "Adidas", "description": "Adidas is a German athletic apparel and footwear corporation.", "website": "https://www.adidas.com"},
            {"name": "Levi's", "description": "Levi Strauss & Co. is known worldwide for its Levi's brand of denim jeans.", "website": "https://www.levi.com"},
            {"name": "Ray-Ban", "description": "Ray-Ban is a brand of luxury sunglasses and eyeglasses.", "website": "https://www.ray-ban.com"},
            {"name": "Ralph Lauren", "description": "Ralph Lauren Corporation produces luxury and mainstream lifestyle collections.", "website": "https://www.ralphlauren.com"},

            # Home & Living
            {"name": "IKEA", "description": "IKEA designs and sells ready-to-assemble furniture and home accessories.", "website": "https://www.ikea.com"},
            {"name": "Dyson", "description": "Dyson is known for innovative vacuum cleaners, air purifiers, and hair care.", "website": "https://www.dyson.com"},
            {"name": "Philips", "description": "Philips is a health technology company focused on improving people's lives.", "website": "https://www.philips.com"},
            {"name": "Le Creuset", "description": "Le Creuset is known for colorful, enameled cast-iron cookware.", "website": "https://www.lecreuset.com"},
            {"name": "Nespresso", "description": "Nespresso offers premium coffee pods and machines.", "website": "https://www.nespresso.com"},

            # Beauty
            {"name": "The Ordinary", "description": "The Ordinary offers clinical formulations with integrity at affordable prices.", "website": "https://theordinary.com"},
            {"name": "CeraVe", "description": "CeraVe is developed with dermatologists for all skin types.", "website": "https://www.cerave.com"},
            {"name": "Estée Lauder", "description": "Estée Lauder manufactures prestige skincare, makeup, and fragrance.", "website": "https://www.esteelauder.com"},
            {"name": "Drunk Elephant", "description": "Drunk Elephant is known for its clean-clinical skincare philosophy.", "website": "https://www.drunkelephant.com"},
            {"name": "Fenty Beauty", "description": "Fenty Beauty by Rihanna is known for inclusive shade ranges.", "website": "https://fentybeauty.com"},

            # Books & Education
            {"name": "Penguin Random House", "description": "The world's largest trade book publisher.", "website": "https://www.penguinrandomhouse.com"},
            {"name": "O'Reilly Media", "description": "O'Reilly publishes books and produces tech conferences.", "website": "https://www.oreilly.com"},
            {"name": "HarperCollins", "description": "One of the world's largest publishing companies.", "website": "https://www.harpercollins.com"},
            {"name": "Pearson", "description": "The largest education company and book publisher in the world.", "website": "https://www.pearson.com"},
            {"name": "McGraw Hill", "description": "McGraw Hill provides educational content and services.", "website": "https://www.mheducation.com"},

            # Sports & Fitness
            {"name": "Peloton", "description": "Peloton offers internet-connected exercise equipment.", "website": "https://www.onepeloton.com"},
            {"name": "Bowflex", "description": "Bowflex is known for innovative home gym equipment.", "website": "https://www.bowflex.com"},
            {"name": "Theragun", "description": "Therabody creates percussion therapy devices.", "website": "https://www.therabody.com"},
            {"name": "Garmin", "description": "Garmin is known for GPS technology and fitness wearables.", "website": "https://www.garmin.com"},
            {"name": "Manduka", "description": "Manduka is a leading yoga lifestyle brand.", "website": "https://www.manduka.com"},

            # Kids & Toys
            {"name": "LEGO", "description": "LEGO manufactures construction toys since 1932.", "website": "https://www.lego.com"},
            {"name": "Nintendo", "description": "Nintendo is known for Mario, Zelda, and Pokémon.", "website": "https://www.nintendo.com"},
            {"name": "Mattel", "description": "Mattel is known for Barbie, Hot Wheels, and Fisher-Price.", "website": "https://www.mattel.com"},
            {"name": "Hasbro", "description": "Hasbro makes Monopoly, Transformers, and My Little Pony.", "website": "https://www.hasbro.com"},
            {"name": "Melissa & Doug", "description": "Melissa & Doug is known for wooden toys and educational products.", "website": "https://www.melissaanddoug.com"},

            # Digital Products
            {"name": "Adobe", "description": "Adobe is known for Creative Cloud, Photoshop, and Acrobat.", "website": "https://www.adobe.com"},
            {"name": "Microsoft", "description": "Microsoft is the world's largest software maker.", "website": "https://www.microsoft.com"},
            {"name": "Udemy", "description": "Udemy offers over 200,000 online courses.", "website": "https://www.udemy.com"},
            {"name": "Spotify", "description": "Spotify is the world's largest music streaming service.", "website": "https://www.spotify.com"},
            {"name": "Canva", "description": "Canva is a graphic design platform for everyone.", "website": "https://www.canva.com"},
        ]

        brands = {}
        for data in brand_data:
            brand, created = Brand.objects.get_or_create(
                slug=slugify(data["name"]),
                defaults={
                    "name": data["name"],
                    "description": data["description"],
                    "website": data["website"],
                    "is_featured": True,
                    "is_active": True,
                }
            )
            brands[slugify(data["name"])] = brand
            status = "✓ Created" if created else "→ Exists"
            self.stdout.write(f"  {status}: {data['name']}")

        return brands

    # ═══════════════════════════════════════════════════════════════
    # CATEGORIES
    # ═══════════════════════════════════════════════════════════════
    def create_categories(self):
        self.stdout.write("\n📂 Creating categories...")

        category_data = [
            {"name": "Electronics", "slug": "electronics", "icon": "laptop", "description": "Latest smartphones, laptops, tablets, and audio equipment.", "key": "electronics"},
            {"name": "Fashion", "slug": "fashion", "icon": "shirt", "description": "Trending clothing, footwear, and accessories.", "key": "fashion"},
            {"name": "Home & Living", "slug": "home-living", "icon": "home", "description": "Furniture, home décor, and kitchen appliances.", "key": "home"},
            {"name": "Beauty & Skincare", "slug": "beauty-skincare", "icon": "sparkles", "description": "Premium skincare, makeup, and personal care.", "key": "beauty"},
            {"name": "Books & Education", "slug": "books-education", "icon": "book-open", "description": "Bestselling books, textbooks, and courses.", "key": "books"},
            {"name": "Sports & Fitness", "slug": "sports-fitness", "icon": "fire", "description": "Exercise equipment, sportswear, and recovery tools.", "key": "sports"},
            {"name": "Kids & Toys", "slug": "kids-toys", "icon": "puzzle", "description": "Educational toys, games, and outdoor play equipment.", "key": "kids"},
            {"name": "Digital Products", "slug": "digital-products", "icon": "cloud-download", "description": "Software, subscriptions, and online courses.", "key": "digital"},
        ]

        categories = {}
        for i, data in enumerate(category_data):
            cat, created = Category.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "description": data["description"],
                    "icon": data["icon"],
                    "display_order": i + 1,
                    "featured": True,
                    "is_active": True,
                }
            )
            categories[data["key"]] = cat
            status = "✓ Created" if created else "→ Exists"
            self.stdout.write(f"  {status}: {data['name']}")

        return categories

    # ═══════════════════════════════════════════════════════════════
    # SHIPPING OPTIONS
    # ═══════════════════════════════════════════════════════════════
    def create_shipping_options(self):
        self.stdout.write("\n🚚 Creating shipping options...")

        shipping_data = [
            {"name": "Standard Shipping", "description": "Regular delivery via ground shipping.", "price": Decimal("5.99"), "estimated_days_min": 5, "estimated_days_max": 7, "is_default": True, "free_shipping_threshold": Decimal("50.00"), "display_order": 1},
            {"name": "Express Shipping", "description": "Faster delivery with priority handling.", "price": Decimal("12.99"), "estimated_days_min": 2, "estimated_days_max": 3, "is_default": False, "free_shipping_threshold": Decimal("100.00"), "display_order": 2},
            {"name": "Next Day Delivery", "description": "Order by 2 PM for next business day delivery.", "price": Decimal("24.99"), "estimated_days_min": 1, "estimated_days_max": 1, "is_default": False, "free_shipping_threshold": Decimal("200.00"), "display_order": 3},
            {"name": "Free Shipping", "description": "Free standard shipping on qualifying orders.", "price": Decimal("0.00"), "estimated_days_min": 7, "estimated_days_max": 10, "is_default": False, "free_shipping_threshold": None, "display_order": 4},
        ]

        for data in shipping_data:
            ship, created = ShippingOption.objects.get_or_create(
                name=data["name"],
                defaults=data
            )
            status = "✓ Created" if created else "→ Exists"
            self.stdout.write(f"  {status}: {data['name']}")

    # ═══════════════════════════════════════════════════════════════
    # HELPER METHOD - CREATE PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def _create_products(self, products_data, category, brands):
        for data in products_data:
            if Product.objects.filter(slug=data["slug"]).exists():
                self.stdout.write(f"  ⏭️  Skipping {data['name']} (already exists)")
                continue

            # Get brand from brands dict
            brand = data.get("brand")
            if isinstance(brand, str):
                brand = brands.get(slugify(brand))

            product = Product.objects.create(
                name=data["name"],
                slug=data["slug"],
                sku=data["sku"],
                description=data["description"].strip(),
                short_description=data["short_description"],
                product_type=data.get("product_type", "physical"),
                price=data["price"],
                compare_price=data.get("compare_price"),
                stock=data["stock"],
                category=category,
                brand=brand,
                weight=data.get("weight"),
                dimensions=data.get("dimensions", ""),
                featured=data.get("featured", False),
                is_new=data.get("is_new", True),
                is_bestseller=data.get("is_bestseller", False),
                is_available=True,
            )

            # Add specifications
            specs = data.get("specs") or data.get("specifications", [])
            for order, spec in enumerate(specs):
                if isinstance(spec, tuple):
                    spec_name, spec_value = spec
                else:
                    spec_name, spec_value = spec.get("name"), spec.get("value")

                ProductSpecification.objects.create(
                    product=product,
                    name=spec_name,
                    value=spec_value,
                    order=order
                )

            self.stdout.write(f"  ✅ Created: {product.name}")

    # ═══════════════════════════════════════════════════════════════
    # ELECTRONICS PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_electronics(self, category, brands):
        self.stdout.write(f"\n📱 Seeding Electronics products...")

        products = [
            {
                "name": "Apple iPhone 15 Pro Max 256GB - Natural Titanium",
                "slug": "apple-iphone-15-pro-max-256gb-natural-titanium",
                "sku": "ELEC-IPHONE15PM-256-NT",
                "price": Decimal("1199.00"),
                "compare_price": Decimal("1299.00"),
                "brand": "apple",
                "stock": 45,
                "weight": Decimal("0.22"),
                "dimensions": "15.99 x 7.69 x 0.83 cm",
                "short_description": "The most powerful iPhone ever with A17 Pro chip, titanium design, and 5x optical zoom.",
                "description": """
Experience the pinnacle of smartphone technology with iPhone 15 Pro Max. Forged in titanium with a stunning Natural Titanium finish.

**A17 Pro Chip** - The first 3-nanometer chip in a smartphone enables console-quality gaming.

**Pro Camera System**
• 48MP Main camera with sensor-shift optical image stabilization
• 5x optical zoom with the longest optical focal length ever on iPhone
• ProRAW and ProRes video recording at up to 4K60 fps

**Display** - 6.7-inch Super Retina XDR display with ProMotion technology.

**Durability** - Aerospace-grade titanium design. Water resistant to 6 meters (IP68).

**Battery** - Up to 29 hours of video playback. USB-C with MagSafe wireless charging.
                """,
                "featured": True,
                "is_bestseller": True,
                "is_new": True,
                "specs": [
                    ("Display", "6.7-inch Super Retina XDR OLED"),
                    ("Chip", "A17 Pro with 6-core GPU"),
                    ("Storage", "256GB"),
                    ("Main Camera", "48MP with ƒ/1.78 aperture"),
                    ("Battery", "Up to 29 hours video playback"),
                    ("Water Resistance", "IP68"),
                ]
            },
            {
                "name": "Samsung Galaxy S24 Ultra 512GB - Titanium Black",
                "slug": "samsung-galaxy-s24-ultra-512gb-titanium-black",
                "sku": "ELEC-SAMS24U-512-TB",
                "price": Decimal("1299.99"),
                "compare_price": Decimal("1419.99"),
                "brand": "samsung",
                "stock": 38,
                "weight": Decimal("0.23"),
                "dimensions": "16.23 x 7.90 x 0.86 cm",
                "short_description": "Samsung's ultimate smartphone with Galaxy AI, S Pen, and 200MP camera system.",
                "description": """
Introducing Galaxy S24 Ultra with groundbreaking Galaxy AI capabilities.

**Galaxy AI Features**
• Live Translate: Real-time call translation
• Circle to Search with Google
• Note Assist: Automatic formatting and summarization

**200MP Camera System** - Capture incredible detail with the highest resolution camera on a Galaxy.

**Display** - 6.8-inch Dynamic AMOLED 2X with 2600 nits peak brightness.

**Built-in S Pen** - Create, annotate, and navigate with precision.

**Battery** - 5000mAh with 45W super fast charging.
                """,
                "featured": True,
                "is_bestseller": True,
                "is_new": True,
                "specs": [
                    ("Display", "6.8-inch Dynamic AMOLED 2X"),
                    ("Processor", "Snapdragon 8 Gen 3"),
                    ("RAM", "12GB"),
                    ("Storage", "512GB"),
                    ("Main Camera", "200MP with OIS"),
                    ("Battery", "5000mAh"),
                ]
            },
            {
                "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                "slug": "sony-wh-1000xm5-wireless-noise-cancelling",
                "sku": "ELEC-SONYWH1KXM5-BLK",
                "price": Decimal("349.99"),
                "compare_price": Decimal("399.99"),
                "brand": "sony",
                "stock": 67,
                "weight": Decimal("0.25"),
                "dimensions": "22.0 x 25.0 x 8.0 cm",
                "short_description": "Industry-leading noise cancellation with exceptional sound quality.",
                "description": """
Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening.

**Industry-Leading Noise Cancellation** - Two processors control 8 microphones.

**Exceptional Sound** - 30mm driver unit with LDAC support for Hi-Res Audio.

**Crystal Clear Calls** - Four beamforming microphones with AI noise reduction.

**30-Hour Battery** - Quick charge: 3 minutes = 3 hours playback.

**Premium Comfort** - Soft fit leather, lightweight at just 250g.
                """,
                "featured": True,
                "is_bestseller": True,
                "is_new": False,
                "specs": [
                    ("Driver Unit", "30mm"),
                    ("Noise Cancellation", "8 Microphones"),
                    ("Battery Life", "Up to 30 hours"),
                    ("Bluetooth", "5.2 with LDAC"),
                    ("Weight", "250g"),
                ]
            },
            {
                "name": "Apple MacBook Pro 14-inch M3 Pro - Space Black",
                "slug": "apple-macbook-pro-14-m3-pro-space-black",
                "sku": "ELEC-MBP14-M3P-SB",
                "price": Decimal("1999.00"),
                "compare_price": Decimal("2199.00"),
                "brand": "apple",
                "stock": 25,
                "weight": Decimal("1.61"),
                "dimensions": "31.26 x 22.12 x 1.55 cm",
                "short_description": "Pro laptop with M3 Pro chip, 18GB unified memory, and Liquid Retina XDR display.",
                "description": """
MacBook Pro 14-inch with M3 Pro supercharges your workflow.

**M3 Pro Chip** - 11-core CPU, 14-core GPU, 18GB unified memory.

**Liquid Retina XDR Display** - 3024 x 1964 resolution, ProMotion 120Hz, 1600 nits peak HDR.

**All-Day Battery** - Up to 17 hours of video playback.

**Pro Connectivity** - Three Thunderbolt 4 ports, HDMI, SD card, MagSafe 3.

**Six-Speaker Sound System** - Spatial Audio with Dolby Atmos.
                """,
                "featured": True,
                "is_bestseller": False,
                "is_new": True,
                "specs": [
                    ("Chip", "Apple M3 Pro"),
                    ("Memory", "18GB Unified"),
                    ("Storage", "512GB SSD"),
                    ("Display", "14.2-inch Liquid Retina XDR"),
                    ("Battery", "Up to 17 hours"),
                ]
            },
            {
                "name": "Apple iPad Pro 12.9-inch M2 256GB - Space Gray",
                "slug": "apple-ipad-pro-12-9-m2-256gb-space-gray",
                "sku": "ELEC-IPADPRO12-M2-256-SG",
                "price": Decimal("1099.00"),
                "compare_price": Decimal("1199.00"),
                "brand": "apple",
                "stock": 33,
                "weight": Decimal("0.68"),
                "dimensions": "28.06 x 21.49 x 0.64 cm",
                "short_description": "The ultimate iPad with M2 chip and Liquid Retina XDR display.",
                "description": """
iPad Pro. Supercharged by M2. The ultimate iPad experience.

**M2 Chip** - 8-core CPU, 10-core GPU, 15.8 trillion operations per second.

**Liquid Retina XDR Display** - mini-LED backlighting, 1,000,000:1 contrast ratio.

**Pro Camera System** - 12MP Wide, 10MP Ultra Wide, LiDAR Scanner.

**Apple Pencil Hover** - Detects Apple Pencil up to 12mm above the display.

**Thunderbolt Connectivity** - USB-C with Thunderbolt/USB 4 support.
                """,
                "featured": True,
                "is_bestseller": False,
                "is_new": True,
                "specs": [
                    ("Chip", "Apple M2"),
                    ("Display", "12.9-inch Liquid Retina XDR"),
                    ("Storage", "256GB"),
                    ("Cameras", "12MP Wide + 10MP Ultra Wide"),
                    ("Battery", "Up to 10 hours"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # FASHION PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_fashion(self, category, brands):
        self.stdout.write(f"\n👗 Seeding Fashion products...")

        products = [
            {
                "name": "Nike Air Jordan 1 Retro High OG - Chicago",
                "slug": "nike-air-jordan-1-retro-high-og-chicago",
                "sku": "FASH-AJ1-CHI-LAF",
                "price": Decimal("180.00"),
                "compare_price": Decimal("220.00"),
                "brand": "nike",
                "stock": 24,
                "weight": Decimal("0.95"),
                "dimensions": "35 x 22 x 14 cm",
                "short_description": "Iconic Chicago colorway with premium leather construction.",
                "description": """
The Air Jordan 1 Retro High OG "Chicago" celebrates the legendary colorway.

**Premium Materials** - Full-grain leather upper with natural creasing.

**Iconic Chicago Colorway** - Varsity Red overlays, white base, black Swoosh.

**Air-Sole Cushioning** - Comfortable all-day wear.

**Authentic Details** - Wings logo, Nike Air branding, OG high-cut silhouette.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Style", "High Top"),
                    ("Material", "Premium Leather"),
                    ("Colorway", "Varsity Red/Black/White"),
                    ("Midsole", "Air-Sole Unit"),
                    ("Closure", "Lace-up"),
                ]
            },
            {
                "name": "Levi's 501 Original Fit Men's Jeans - Stonewash",
                "slug": "levis-501-original-fit-mens-jeans-stonewash",
                "sku": "FASH-LEVI501-SW-32",
                "price": Decimal("69.50"),
                "compare_price": Decimal("89.50"),
                "brand": "levis",
                "stock": 85,
                "weight": Decimal("0.65"),
                "dimensions": "42 x 32 x 5 cm",
                "short_description": "The original blue jean since 1873. Straight leg, button fly.",
                "description": """
Since 1873, the Levi's 501 has been the gold standard for denim.

**Original Fit** - Straight leg from hip to ankle, classic rise.

**Premium Denim** - 100% cotton, 12.5 oz. heavyweight fabric.

**Iconic Details** - Two Horse leather patch, Arcuate stitching, Red Tab.

**Sustainable** - Water<Less® finishing uses up to 96% less water.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Fit", "Original Straight Leg"),
                    ("Material", "100% Cotton"),
                    ("Fly", "Button"),
                    ("Wash", "Stonewash"),
                    ("Pockets", "5-Pocket Styling"),
                ]
            },
            {
                "name": "Ray-Ban Aviator Classic Sunglasses - Gold/Green",
                "slug": "ray-ban-aviator-classic-sunglasses-gold-green",
                "sku": "FASH-RB-AVIATOR-GG",
                "price": Decimal("161.00"),
                "compare_price": Decimal("198.00"),
                "brand": "ray-ban",
                "stock": 42,
                "weight": Decimal("0.03"),
                "dimensions": "14.5 x 5.5 x 5.0 cm",
                "short_description": "The iconic pilot silhouette. Crystal green G-15 lenses.",
                "description": """
Originally designed in 1937 for U.S. aviators.

**Crystal Green G-15 Lenses** - Blocks 85% of visible light, natural vision.

**Gold Metal Frame** - Electroplated gold finish, adjustable nose pads.

**100% UV Protection** - Blocks all UVA and UVB rays.

**Authentic Details** - Etched "RB" on lens, original case included.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Model", "RB3025 Aviator Classic"),
                    ("Frame", "Gold Metal"),
                    ("Lens", "Crystal Green G-15"),
                    ("Lens Size", "58mm"),
                    ("UV Protection", "100% UV400"),
                ]
            },
            {
                "name": "Adidas Ultraboost 23 Running Shoes - Core Black",
                "slug": "adidas-ultraboost-23-running-shoes-core-black",
                "sku": "FASH-ADUB23-BLK-10",
                "price": Decimal("190.00"),
                "compare_price": Decimal("220.00"),
                "brand": "adidas",
                "stock": 55,
                "weight": Decimal("0.68"),
                "dimensions": "33 x 20 x 12 cm",
                "short_description": "Energy-returning Boost midsole with Primeknit+ upper.",
                "description": """
Adidas Ultraboost 23 delivers legendary energy return.

**Boost Technology** - Thousands of TPU capsules store and unleash energy.

**Primeknit+ Upper** - Seamless stretch for natural movement.

**Continental™ Rubber Outsole** - Trusted grip in all conditions.

**Sustainability** - Made with Primeblue recycled materials.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Style", "Running"),
                    ("Upper", "Primeknit+ Textile"),
                    ("Midsole", "Boost Foam"),
                    ("Outsole", "Continental Rubber"),
                    ("Drop", "10mm"),
                ]
            },
            {
                "name": "Ralph Lauren Classic Fit Mesh Polo - Newport Navy",
                "slug": "ralph-lauren-classic-fit-mesh-polo-navy",
                "sku": "FASH-RL-POLO-NN-L",
                "price": Decimal("98.50"),
                "compare_price": Decimal("125.00"),
                "brand": "ralph-lauren",
                "stock": 120,
                "weight": Decimal("0.25"),
                "dimensions": "38 x 30 x 3 cm",
                "short_description": "Iconic mesh polo with embroidered Pony logo.",
                "description": """
The Ralph Lauren Polo Shirt is an American icon.

**Classic Fit** - Relaxed through chest and body, straight hem.

**Premium Cotton Mesh** - Soft, breathable, lightweight.

**Signature Details** - Embroidered Polo Pony, ribbed collar and cuffs.

**Versatile Styling** - From office to weekend.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Fit", "Classic Fit"),
                    ("Material", "100% Cotton Mesh"),
                    ("Collar", "Ribbed Polo Collar"),
                    ("Closure", "Two-Button Placket"),
                    ("Color", "Newport Navy"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # HOME & LIVING PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_home_living(self, category, brands):
        self.stdout.write(f"\n🏠 Seeding Home & Living products...")

        products = [
            {
                "name": "Dyson V15 Detect Absolute Cordless Vacuum",
                "slug": "dyson-v15-detect-absolute-cordless-vacuum",
                "sku": "HOME-DYSONV15-DET-ABS",
                "price": Decimal("749.99"),
                "compare_price": Decimal("849.99"),
                "brand": "dyson",
                "stock": 28,
                "weight": Decimal("2.74"),
                "dimensions": "25.4 x 126.4 x 25.0 cm",
                "short_description": "Laser reveals invisible dust. Up to 60 minutes runtime.",
                "description": """
Dyson V15 Detect reveals invisible dust with laser technology.

**Laser Dust Detection** - Green laser reveals invisible particles.

**Piezo Sensor** - Counts particles 24,000 times per second.

**Hyperdymium Motor** - 230 air watts of suction power.

**HEPA Filtration** - Captures 99.99% of particles as small as 0.3 microns.

**60-Minute Runtime** - Fade-free power with intelligent power adaptation.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Motor", "Hyperdymium (125,000 RPM)"),
                    ("Suction Power", "230 AW"),
                    ("Runtime", "Up to 60 minutes"),
                    ("Filtration", "Whole-machine HEPA"),
                    ("Bin Capacity", "0.76 liters"),
                ]
            },
            {
                "name": "IKEA MALM Queen Bed Frame with Storage - White Oak",
                "slug": "ikea-malm-queen-bed-frame-storage-white-oak",
                "sku": "HOME-MALM-BED-Q-WO",
                "price": Decimal("449.00"),
                "compare_price": Decimal("549.00"),
                "brand": "ikea",
                "stock": 18,
                "weight": Decimal("95.00"),
                "dimensions": "209 x 156 x 100 cm",
                "short_description": "Modern bed frame with 4 storage drawers.",
                "description": """
The MALM bed frame combines Scandinavian design with smart storage.

**Smart Storage** - 4 spacious rolling drawers.

**Quality Construction** - Particleboard with white oak veneer.

**Mattress Support** - 17 wooden slats included.

**Clean Design** - Modern, minimalist aesthetic.

**Assembly Required** - Approximately 1.5 hours, 2-person recommended.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Size", "Queen (60\" x 80\" mattress)"),
                    ("Material", "Particleboard, White Oak Veneer"),
                    ("Storage", "4 Drawers"),
                    ("Max Weight", "450 lbs"),
                    ("Assembly", "Required"),
                ]
            },
            {
                "name": "Philips Hue White and Color Ambiance Starter Kit",
                "slug": "philips-hue-white-color-ambiance-starter-kit",
                "sku": "HOME-PHILIPSHUE-WCASK",
                "price": Decimal("199.99"),
                "compare_price": Decimal("249.99"),
                "brand": "philips",
                "stock": 45,
                "weight": Decimal("0.95"),
                "dimensions": "20 x 15 x 10 cm",
                "short_description": "Smart lighting with 4 color bulbs and Hue Bridge. 16 million colors.",
                "description": """
Transform your home with Philips Hue smart lighting.

**What's Included** - 4 color bulbs + Hue Bridge.

**16 Million Colors** - Full spectrum RGB plus warm to cool white.

**Smart Control** - App, voice (Alexa, Google, Siri), automation.

**Energy Efficient** - LED uses 80% less energy, 25,000-hour lifespan.

**Expandable** - Add up to 50 lights to one Bridge.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Bulbs", "4 x A19 Color"),
                    ("Lumens", "800 per bulb"),
                    ("Colors", "16 million"),
                    ("Voice Control", "Alexa, Google, Siri"),
                    ("Bridge Capacity", "Up to 50 lights"),
                ]
            },
            {
                "name": "Le Creuset Signature Dutch Oven 5.5 Qt - Flame",
                "slug": "le-creuset-signature-dutch-oven-5-5-qt-flame",
                "sku": "HOME-LECREUSET-DO55-FL",
                "price": Decimal("379.95"),
                "compare_price": Decimal("439.95"),
                "brand": "le-creuset",
                "stock": 22,
                "weight": Decimal("5.67"),
                "dimensions": "30.5 x 26.7 x 15.2 cm",
                "short_description": "Iconic French cookware. Premium enameled cast iron.",
                "description": """
Le Creuset has been crafting premium French cookware since 1925.

**Handcrafted** - Cast individually in sand molds by French artisans.

**Superior Heat Distribution** - Even cooking without hot spots.

**Versatile Cooking** - Braising, roasting, baking, and more.

**Oven Safe** - Up to 500°F, works on all cooktops including induction.

**Lifetime Warranty** - Backed by Le Creuset quality.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Capacity", "5.5 quarts"),
                    ("Material", "Enameled Cast Iron"),
                    ("Color", "Flame Orange"),
                    ("Oven Safe", "Up to 500°F"),
                    ("Made In", "France"),
                ]
            },
            {
                "name": "Nespresso Vertuo Next Premium Coffee Machine",
                "slug": "nespresso-vertuo-next-premium-coffee-machine",
                "sku": "HOME-NESPVNEXT-CHR",
                "price": Decimal("179.00"),
                "compare_price": Decimal("229.00"),
                "brand": "nespresso",
                "stock": 35,
                "weight": Decimal("4.00"),
                "dimensions": "14.2 x 42.9 x 31.4 cm",
                "short_description": "Single-serve coffee with Centrifusion technology. 5 coffee sizes.",
                "description": """
Nespresso Vertuo Next brews the perfect cup every time.

**Centrifusion™ Technology** - Spins capsule at 7,000 RPM for optimal extraction.

**5 Coffee Sizes** - From Espresso to Alto (14 oz).

**Barcode Recognition** - Automatic brewing parameters per capsule.

**Smart Connected** - Bluetooth and Wi-Fi enabled.

**Fast Heat-Up** - Ready in 30 seconds.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Technology", "Centrifusion™"),
                    ("Cup Sizes", "5 (Espresso to Alto)"),
                    ("Water Tank", "37 oz"),
                    ("Heat-up Time", "30 seconds"),
                    ("Connectivity", "Bluetooth, Wi-Fi"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # BEAUTY & SKINCARE PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_beauty(self, category, brands):
        self.stdout.write(f"\n💄 Seeding Beauty & Skincare products...")

        products = [
            {
                "name": "CeraVe Hydrating Facial Cleanser 473ml",
                "slug": "cerave-hydrating-facial-cleanser-473ml",
                "sku": "BEAUTY-CERAVE-001",
                "price": Decimal("18.99"),
                "compare_price": Decimal("24.99"),
                "brand": "cerave",
                "stock": 150,
                "weight": Decimal("0.55"),
                "dimensions": "8 x 5 x 20 cm",
                "short_description": "Gentle, non-foaming cleanser with ceramides and hyaluronic acid.",
                "description": """
CeraVe Hydrating Facial Cleanser for normal to dry skin.

**Key Ingredients** - 3 essential ceramides + hyaluronic acid.

**Gentle Formula** - Non-foaming, fragrance-free.

**MVE Technology** - Long-lasting hydration.

**Developed with Dermatologists** - Accepted by National Eczema Association.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Volume", "473ml / 16 fl oz"),
                    ("Skin Type", "Normal to Dry"),
                    ("Key Ingredients", "Ceramides, Hyaluronic Acid"),
                    ("Fragrance", "Fragrance-Free"),
                    ("Cruelty-Free", "Yes"),
                ]
            },
            {
                "name": "The Ordinary Niacinamide 10% + Zinc 1% Serum",
                "slug": "the-ordinary-niacinamide-zinc-serum-30ml",
                "sku": "BEAUTY-ORDINARY-002",
                "price": Decimal("12.50"),
                "compare_price": Decimal("16.00"),
                "brand": "the-ordinary",
                "stock": 200,
                "weight": Decimal("0.08"),
                "dimensions": "3 x 3 x 10 cm",
                "short_description": "High-strength vitamin and mineral formula for blemishes and pores.",
                "description": """
The Ordinary Niacinamide 10% + Zinc 1% targets blemishes and enlarged pores.

**10% Niacinamide** - Visible pore reduction.

**1% Zinc PCA** - Regulates sebum production.

**Lightweight** - Water-based formula.

**Vegan & Cruelty-Free** - Alcohol-free, silicone-free.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Volume", "30ml / 1 fl oz"),
                    ("Active Ingredients", "10% Niacinamide, 1% Zinc"),
                    ("Skin Type", "Oily, Combination, Acne-Prone"),
                    ("Format", "Water-Based Serum"),
                    ("Vegan", "Yes"),
                ]
            },
            {
                "name": "Drunk Elephant Protini Polypeptide Cream",
                "slug": "drunk-elephant-protini-polypeptide-cream",
                "sku": "BEAUTY-DE-PROTINI-001",
                "price": Decimal("68.00"),
                "compare_price": Decimal("78.00"),
                "brand": "drunk-elephant",
                "stock": 65,
                "weight": Decimal("0.12"),
                "dimensions": "5 x 5 x 5 cm",
                "short_description": "Protein moisturizer with peptides for firmer, stronger skin.",
                "description": """
Drunk Elephant Protini delivers visible improvement in skin's tone and texture.

**Signal Peptides** - Support skin's natural collagen.

**Growth Factors** - Improve firmness and elasticity.

**Amino Acids** - Provide essential building blocks.

**Clean Formula** - Free of the "Suspicious 6."
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Volume", "50ml / 1.69 fl oz"),
                    ("Skin Type", "All Skin Types"),
                    ("Key Ingredients", "Peptides, Amino Acids"),
                    ("Format", "Moisturizer"),
                    ("Clean", "Yes - Suspicious 6 Free"),
                ]
            },
            {
                "name": "Fenty Beauty Pro Filt'r Soft Matte Foundation",
                "slug": "fenty-beauty-pro-filtr-foundation",
                "sku": "BEAUTY-FENTY-FOUND-001",
                "price": Decimal("40.00"),
                "compare_price": Decimal("48.00"),
                "brand": "fenty-beauty",
                "stock": 180,
                "weight": Decimal("0.10"),
                "dimensions": "4 x 4 x 12 cm",
                "short_description": "Soft matte foundation in 50 shades for all skin tones.",
                "description": """
Fenty Beauty Pro Filt'r delivers buildable, longwear coverage.

**50 Shades** - Inclusive range for all skin tones.

**Soft Matte Finish** - Controls shine without drying.

**Buildable Coverage** - Medium to full.

**Longwear** - Up to 12 hours of wear.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Volume", "32ml / 1.08 fl oz"),
                    ("Finish", "Soft Matte"),
                    ("Coverage", "Medium to Full"),
                    ("Shades", "50"),
                    ("Wear Time", "Up to 12 hours"),
                ]
            },
            {
                "name": "Estée Lauder Advanced Night Repair Serum",
                "slug": "estee-lauder-advanced-night-repair-serum",
                "sku": "BEAUTY-EL-ANR-001",
                "price": Decimal("105.00"),
                "compare_price": Decimal("125.00"),
                "brand": "estee-lauder",
                "stock": 55,
                "weight": Decimal("0.15"),
                "dimensions": "5 x 5 x 12 cm",
                "short_description": "The #1 repair serum. Reduces lines and wrinkles in just 3 weeks.",
                "description": """
Estée Lauder Advanced Night Repair - The world's #1 repair serum.

**Chronolux™ Power Signal Technology** - Supports skin's natural repair.

**Reduces Lines & Wrinkles** - Visible results in 3 weeks.

**7 Key Signs of Aging** - Addresses lines, wrinkles, dryness, dullness, and more.

**Lightweight** - Fast-absorbing, non-greasy formula.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Volume", "50ml / 1.7 fl oz"),
                    ("Skin Type", "All Skin Types"),
                    ("Key Technology", "Chronolux™"),
                    ("Benefits", "Anti-Aging, Hydrating, Firming"),
                    ("Use", "Morning and Night"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # BOOKS & EDUCATION PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_books(self, category, brands):
        self.stdout.write(f"\n📚 Seeding Books & Education products...")

        products = [
            {
                "name": "Atomic Habits by James Clear - Hardcover",
                "slug": "atomic-habits-james-clear-hardcover",
                "sku": "BOOKS-ATOMIC-001",
                "price": Decimal("24.99"),
                "compare_price": Decimal("32.00"),
                "brand": "penguin-random-house",
                "stock": 75,
                "weight": Decimal("0.45"),
                "dimensions": "21 x 14 x 3 cm",
                "short_description": "#1 New York Times bestseller on building good habits and breaking bad ones.",
                "description": """
Atomic Habits by James Clear - over 15 million copies sold worldwide.

**Key Concepts** - The 1% Rule, Four Laws of Behavior Change, Habit Stacking.

**Proven Framework** - For building good habits and breaking bad ones.

**320 Pages** - Hardcover with dust jacket.

**Translated** - Available in 50+ languages.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Author", "James Clear"),
                    ("Pages", "320"),
                    ("Format", "Hardcover"),
                    ("Language", "English"),
                    ("ISBN", "978-0735211292"),
                ]
            },
            {
                "name": "Python Crash Course 3rd Edition",
                "slug": "python-crash-course-3rd-edition",
                "sku": "BOOKS-PYTHON-002",
                "price": Decimal("39.99"),
                "compare_price": Decimal("49.99"),
                "brand": "oreilly-media",
                "stock": 60,
                "weight": Decimal("0.85"),
                "dimensions": "23 x 18 x 3 cm",
                "short_description": "The world's best-selling Python book. Hands-on, project-based.",
                "description": """
Python Crash Course by Eric Matthes - over 1.5 million copies sold.

**Part 1** - Python Fundamentals: variables, functions, classes, files.

**Part 2** - Three Real-World Projects: game, data visualization, web app.

**Updated** - For Python 3.11+ with modern best practices.

**552 Pages** - Full-color illustrations with downloadable code.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Author", "Eric Matthes"),
                    ("Edition", "3rd Edition (2023)"),
                    ("Pages", "552"),
                    ("Format", "Paperback"),
                    ("Skill Level", "Beginner to Intermediate"),
                ]
            },
            {
                "name": "The Psychology of Money - Morgan Housel",
                "slug": "psychology-of-money-morgan-housel",
                "sku": "BOOKS-PSYMONEY-003",
                "price": Decimal("18.99"),
                "compare_price": Decimal("24.00"),
                "brand": "harpercollins",
                "stock": 90,
                "weight": Decimal("0.30"),
                "dimensions": "20 x 13 x 2 cm",
                "short_description": "Timeless lessons on wealth, greed, and happiness.",
                "description": """
The Psychology of Money by Morgan Housel - a new way to think about money.

**19 Short Stories** - Exploring the strange ways people think about money.

**Timeless Lessons** - On wealth, greed, and happiness.

**256 Pages** - Accessible and engaging read.

**#1 Best Seller** - Over 3 million copies sold.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Author", "Morgan Housel"),
                    ("Pages", "256"),
                    ("Format", "Paperback"),
                    ("Topic", "Personal Finance, Psychology"),
                    ("ISBN", "978-0857197689"),
                ]
            },
            {
                "name": "Clean Code: A Handbook - Robert C. Martin",
                "slug": "clean-code-robert-martin",
                "sku": "BOOKS-CLEANCODE-004",
                "price": Decimal("44.99"),
                "compare_price": Decimal("54.99"),
                "brand": "pearson",
                "stock": 45,
                "weight": Decimal("0.70"),
                "dimensions": "24 x 18 x 3 cm",
                "short_description": "The definitive guide to writing readable, maintainable code.",
                "description": """
Clean Code by Robert C. Martin (Uncle Bob) - essential reading for developers.

**Part 1** - Principles, patterns, and practices of clean code.

**Part 2** - Case studies of increasing complexity.

**Part 3** - Heuristics and smells for clean code.

**464 Pages** - Comprehensive coverage with code examples.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Author", "Robert C. Martin"),
                    ("Pages", "464"),
                    ("Format", "Paperback"),
                    ("Topic", "Software Development"),
                    ("Skill Level", "Intermediate to Advanced"),
                ]
            },
            {
                "name": "Sapiens: A Brief History of Humankind",
                "slug": "sapiens-brief-history-humankind",
                "sku": "BOOKS-SAPIENS-005",
                "price": Decimal("22.99"),
                "compare_price": Decimal("29.99"),
                "brand": "harpercollins",
                "stock": 70,
                "weight": Decimal("0.50"),
                "dimensions": "23 x 15 x 3 cm",
                "short_description": "Yuval Noah Harari explores the history of our species.",
                "description": """
Sapiens by Yuval Noah Harari - over 25 million copies sold.

**Cognitive Revolution** - 70,000 years ago.

**Agricultural Revolution** - 12,000 years ago.

**Scientific Revolution** - 500 years ago.

**512 Pages** - Sweeping narrative of human history.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Author", "Yuval Noah Harari"),
                    ("Pages", "512"),
                    ("Format", "Paperback"),
                    ("Topic", "History, Anthropology"),
                    ("ISBN", "978-0062316110"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # SPORTS & FITNESS PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_sports(self, category, brands):
        self.stdout.write(f"\n🏃 Seeding Sports & Fitness products...")

        products = [
            {
                "name": "Peloton Bike+ Indoor Exercise Bike",
                "slug": "peloton-bike-plus-indoor-exercise",
                "sku": "SPORTS-PELOTON-BIKE-001",
                "price": Decimal("2495.00"),
                "compare_price": Decimal("2795.00"),
                "brand": "peloton",
                "stock": 12,
                "weight": Decimal("63.50"),
                "dimensions": "150 x 60 x 135 cm",
                "short_description": "Premium connected bike with rotating 23.8\" HD touchscreen.",
                "description": """
Peloton Bike+ - The ultimate connected fitness experience.

**23.8" HD Touchscreen** - Rotates 360° for on and off-bike workouts.

**Apple GymKit** - Seamless Apple Watch integration.

**Auto-Follow** - Automatic resistance adjustments during class.

**Thousands of Classes** - Live and on-demand cycling, strength, yoga, and more.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Screen", "23.8\" HD Rotating Touchscreen"),
                    ("Resistance Levels", "100"),
                    ("Weight Capacity", "297 lbs"),
                    ("Dimensions", "59\"L x 22\"W x 53\"H"),
                    ("Subscription", "Required for full experience"),
                ]
            },
            {
                "name": "Bowflex SelectTech 552 Adjustable Dumbbells",
                "slug": "bowflex-selecttech-552-adjustable-dumbbells",
                "sku": "SPORTS-BOWFLEX-552-001",
                "price": Decimal("429.00"),
                "compare_price": Decimal("549.00"),
                "brand": "bowflex",
                "stock": 35,
                "weight": Decimal("24.00"),
                "dimensions": "43 x 21 x 23 cm",
                "short_description": "Replaces 15 sets of weights. 5-52.5 lbs per dumbbell.",
                "description": """
Bowflex SelectTech 552 - Space-saving adjustable dumbbells.

**15 Weight Settings** - 5 to 52.5 lbs in 2.5 lb increments.

**Quick-Change Dial** - Switch weights in seconds.

**Replaces 30 Dumbbells** - Save space in your home gym.

**2-Year Warranty** - Backed by Bowflex quality.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Weight Range", "5-52.5 lbs per dumbbell"),
                    ("Increments", "2.5 lbs"),
                    ("Includes", "2 Dumbbells + Trays"),
                    ("Material", "Steel with rubber coating"),
                    ("Warranty", "2 Years"),
                ]
            },
            {
                "name": "Theragun PRO Percussive Therapy Device",
                "slug": "theragun-pro-percussive-therapy-device",
                "sku": "SPORTS-THERAGUN-PRO-001",
                "price": Decimal("449.00"),
                "compare_price": Decimal("599.00"),
                "brand": "theragun",
                "stock": 40,
                "weight": Decimal("1.30"),
                "dimensions": "25 x 18 x 8 cm",
                "short_description": "Professional-grade percussive therapy. 60 lbs force, 5 speeds.",
                "description": """
Theragun PRO - The professional-grade deep muscle treatment.

**60 lbs Force** - Deepest muscle treatment available.

**5 Built-In Speeds** - 1750-2400 PPMs.

**QuietForce Technology** - Proprietary brushless motor.

**OLED Screen** - Force meter and speed controls.

**Rotating Arm** - Ergonomic multi-grip design.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Force", "Up to 60 lbs"),
                    ("Speeds", "5 (1750-2400 PPMs)"),
                    ("Battery Life", "150 minutes"),
                    ("Attachments", "6 included"),
                    ("Warranty", "2 Years"),
                ]
            },
            {
                "name": "Garmin Forerunner 965 GPS Running Watch",
                "slug": "garmin-forerunner-965-gps-running-watch",
                "sku": "SPORTS-GARMIN-FR965-001",
                "price": Decimal("599.99"),
                "compare_price": Decimal("649.99"),
                "brand": "garmin",
                "stock": 28,
                "weight": Decimal("0.05"),
                "dimensions": "4.7 x 4.7 x 1.4 cm",
                "short_description": "Premium triathlon smartwatch with AMOLED display and full maps.",
                "description": """
Garmin Forerunner 965 - The ultimate running companion.

**1.4" AMOLED Display** - Bright, colorful, always-on.

**Full Color Maps** - Turn-by-turn navigation.

**Training Readiness** - Know when to push and when to rest.

**23-Day Battery** - Smartwatch mode with AMOLED display.

**All Sports** - Running, cycling, swimming, and more.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Display", "1.4\" AMOLED"),
                    ("Battery", "Up to 23 days"),
                    ("Water Rating", "5 ATM"),
                    ("GPS", "Multi-band with maps"),
                    ("Music Storage", "Up to 2000 songs"),
                ]
            },
            {
                "name": "Manduka PRO Yoga Mat 6mm - Black",
                "slug": "manduka-pro-yoga-mat-6mm-black",
                "sku": "SPORTS-MANDUKA-PRO-001",
                "price": Decimal("120.00"),
                "compare_price": Decimal("140.00"),
                "brand": "manduka",
                "stock": 55,
                "weight": Decimal("3.40"),
                "dimensions": "180 x 66 x 0.6 cm",
                "short_description": "The legendary PRO mat. Dense cushioning, lifetime guarantee.",
                "description": """
Manduka PRO - The gold standard of yoga mats.

**6mm Density** - Superior joint protection and cushioning.

**Closed-Cell Surface** - Hygienic, prevents sweat absorption.

**High-Density Cushion** - Never wears out, never bunches.

**Lifetime Guarantee** - Built to last a lifetime.

**Trusted by Teachers** - The #1 choice of yoga professionals.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Thickness", "6mm"),
                    ("Dimensions", "71\" x 26\""),
                    ("Material", "PVC"),
                    ("Weight", "7.5 lbs"),
                    ("Warranty", "Lifetime Guarantee"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # KIDS & TOYS PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_kids_toys(self, category, brands):
        self.stdout.write(f"\n🧸 Seeding Kids & Toys products...")

        products = [
            {
                "name": "LEGO Star Wars Millennium Falcon 75375",
                "slug": "lego-star-wars-millennium-falcon-75375",
                "sku": "KIDS-LEGO-MF-001",
                "price": Decimal("84.99"),
                "compare_price": Decimal("99.99"),
                "brand": "lego",
                "stock": 35,
                "weight": Decimal("1.45"),
                "dimensions": "48 x 28 x 8 cm",
                "short_description": "Build the legendary Millennium Falcon with 921 pieces and 6 minifigures.",
                "description": """
LEGO Star Wars Millennium Falcon - The fastest ship in the galaxy.

**921 Pieces** - Ages 9+, 4-6 hour build time.

**6 Minifigures** - Han Solo, Chewbacca, Leia, Luke, Obi-Wan, C-3PO.

**Authentic Details** - Opening cockpit, rotating turrets, secret compartment.

**Display or Play** - Includes display stand with nameplate.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Pieces", "921"),
                    ("Age Range", "9+ years"),
                    ("Minifigures", "6 included"),
                    ("Theme", "Star Wars"),
                    ("Dimensions", "17\" x 12\" x 5\""),
                ]
            },
            {
                "name": "Nintendo Switch OLED Model - White",
                "slug": "nintendo-switch-oled-model-white",
                "sku": "KIDS-SWITCH-OLED-001",
                "price": Decimal("349.99"),
                "compare_price": Decimal("399.99"),
                "brand": "nintendo",
                "stock": 42,
                "weight": Decimal("0.42"),
                "dimensions": "24 x 10 x 1.4 cm",
                "short_description": "Vibrant 7-inch OLED screen with enhanced audio and 64GB storage.",
                "description": """
Nintendo Switch OLED Model - Play at home or on the go.

**7-inch OLED Screen** - Vibrant colors and crisp contrast.

**64GB Internal Storage** - Double the original model.

**Enhanced Audio** - New speakers for handheld/tabletop play.

**Wide Adjustable Stand** - Improved tabletop mode.

**Wired LAN Port** - Included in dock for stable online play.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Screen", "7\" OLED"),
                    ("Storage", "64GB"),
                    ("Battery Life", "4.5-9 hours"),
                    ("Modes", "TV, Tabletop, Handheld"),
                    ("Online", "Nintendo Switch Online required"),
                ]
            },
            {
                "name": "Barbie Dreamhouse 2023 Edition",
                "slug": "barbie-dreamhouse-2023-edition",
                "sku": "KIDS-BARBIE-DH-001",
                "price": Decimal("199.99"),
                "compare_price": Decimal("249.99"),
                "brand": "mattel",
                "stock": 22,
                "weight": Decimal("8.50"),
                "dimensions": "110 x 80 x 30 cm",
                "short_description": "3.75-foot tall dollhouse with 10 rooms, slide, elevator, and 75+ pieces.",
                "description": """
Barbie Dreamhouse 2023 - The ultimate dollhouse experience.

**3.75 Feet Tall** - 10 indoor/outdoor areas.

**Working Elevator** - Fits Barbie doll and wheelchair.

**Pool Slide** - From top floor to ground level.

**75+ Pieces** - Furniture, accessories, and decor included.

**Lights and Sounds** - Interactive play features.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Height", "3.75 feet"),
                    ("Rooms", "10 areas"),
                    ("Pieces", "75+ included"),
                    ("Age Range", "3-7 years"),
                    ("Assembly", "Adult assembly required"),
                ]
            },
            {
                "name": "Melissa & Doug Wooden Building Blocks Set",
                "slug": "melissa-doug-wooden-building-blocks-100",
                "sku": "KIDS-MD-BLOCKS-001",
                "price": Decimal("29.99"),
                "compare_price": Decimal("39.99"),
                "brand": "melissa-doug",
                "stock": 85,
                "weight": Decimal("2.00"),
                "dimensions": "35 x 25 x 10 cm",
                "short_description": "100 solid wood blocks in 4 colors and 9 shapes. Classic play.",
                "description": """
Melissa & Doug Wooden Building Blocks - Classic open-ended play.

**100 Pieces** - Solid hardwood construction.

**4 Colors** - Blue, green, red, yellow, plus natural wood.

**9 Shapes** - Cubes, cylinders, arches, triangles, and more.

**Durable** - Built to last for generations.

**Storage Case** - Wooden crate with handles included.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Pieces", "100"),
                    ("Material", "Solid Hardwood"),
                    ("Colors", "4 colors + natural"),
                    ("Age Range", "3+ years"),
                    ("Storage", "Wooden crate included"),
                ]
            },
            {
                "name": "Hasbro Monopoly Classic Board Game",
                "slug": "hasbro-monopoly-classic-board-game",
                "sku": "KIDS-MONOPOLY-001",
                "price": Decimal("19.99"),
                "compare_price": Decimal("24.99"),
                "brand": "hasbro",
                "stock": 120,
                "weight": Decimal("0.90"),
                "dimensions": "40 x 27 x 5 cm",
                "short_description": "The classic property trading game. 2-8 players, ages 8+.",
                "description": """
Monopoly Classic - The world's favorite family game.

**Buy Properties** - Build houses and hotels.

**Collect Rent** - Bankrupt your opponents.

**Classic Tokens** - Includes 8 iconic metal tokens.

**2-8 Players** - Ages 8 and up.

**Everything Included** - Board, tokens, cards, money, dice.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Players", "2-8"),
                    ("Age Range", "8+ years"),
                    ("Play Time", "60-180 minutes"),
                    ("Tokens", "8 metal tokens"),
                    ("Contents", "Board, cards, money, dice"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # DIGITAL PRODUCTS
    # ═══════════════════════════════════════════════════════════════
    def seed_digital(self, category, brands):
        self.stdout.write(f"\n💻 Seeding Digital Products...")

        products = [
            {
                "name": "Complete Web Development Bootcamp 2024",
                "slug": "complete-web-development-bootcamp-2024",
                "sku": "DIGITAL-WEBDEV-001",
                "price": Decimal("19.99"),
                "compare_price": Decimal("199.99"),
                "brand": "udemy",
                "stock": 9999,
                "weight": None,
                "dimensions": "",
                "product_type": "digital",
                "short_description": "Master HTML, CSS, JavaScript, React, Node.js with 65+ hours of content.",
                "description": """
Complete Web Development Bootcamp - From zero to full-stack developer.

**65+ Hours** - HD video content with lifetime access.

**Frontend** - HTML, CSS, JavaScript, React.

**Backend** - Node.js, Express, MongoDB, PostgreSQL.

**15 Projects** - Real-world portfolio projects.

**Certificate** - Upon completion.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Duration", "65+ hours"),
                    ("Skill Level", "Beginner to Advanced"),
                    ("Projects", "15 Real-World Projects"),
                    ("Access", "Lifetime"),
                    ("Certificate", "Yes"),
                ]
            },
            {
                "name": "Adobe Creative Cloud All Apps - 1 Year",
                "slug": "adobe-creative-cloud-all-apps-1-year",
                "sku": "DIGITAL-ADOBE-CC-001",
                "price": Decimal("599.88"),
                "compare_price": Decimal("719.88"),
                "brand": "adobe",
                "stock": 9999,
                "weight": None,
                "dimensions": "",
                "product_type": "digital",
                "short_description": "All 20+ creative apps including Photoshop, Illustrator, Premiere Pro.",
                "description": """
Adobe Creative Cloud All Apps - The complete creative toolkit.

**20+ Apps** - Photoshop, Illustrator, Premiere Pro, After Effects, and more.

**100GB Cloud Storage** - Store and sync your files.

**Adobe Fonts** - Access thousands of fonts.

**Behance Integration** - Showcase your work.

**Always Updated** - Latest features and updates.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Apps Included", "20+"),
                    ("Cloud Storage", "100GB"),
                    ("Subscription", "12 Months"),
                    ("Platforms", "Windows, Mac, iOS, Android"),
                    ("Delivery", "Instant - Email License"),
                ]
            },
            {
                "name": "Microsoft 365 Family - 1 Year Subscription",
                "slug": "microsoft-365-family-1-year",
                "sku": "DIGITAL-M365-FAM-001",
                "price": Decimal("99.99"),
                "compare_price": Decimal("129.99"),
                "brand": "microsoft",
                "stock": 9999,
                "weight": None,
                "dimensions": "",
                "product_type": "digital",
                "short_description": "Office apps for up to 6 people. 1TB OneDrive per person.",
                "description": """
Microsoft 365 Family - The complete productivity solution.

**Up to 6 Users** - Each with their own account.

**1TB OneDrive Each** - 6TB total cloud storage.

**Premium Office Apps** - Word, Excel, PowerPoint, Outlook.

**Advanced Security** - Defender for identity protection.

**Mobile Apps** - iOS and Android included.
                """,
                "featured": True,
                "is_bestseller": True,
                "specs": [
                    ("Users", "Up to 6"),
                    ("Storage", "1TB per person"),
                    ("Apps", "Word, Excel, PowerPoint, Outlook"),
                    ("Subscription", "12 Months"),
                    ("Platforms", "PC, Mac, iOS, Android"),
                ]
            },
            {
                "name": "Spotify Premium - 12 Month Gift Card",
                "slug": "spotify-premium-12-month-gift-card",
                "sku": "DIGITAL-SPOTIFY-12M-001",
                "price": Decimal("129.99"),
                "compare_price": Decimal("143.88"),
                "brand": "spotify",
                "stock": 9999,
                "weight": None,
                "dimensions": "",
                "product_type": "digital",
                "short_description": "Ad-free music streaming with offline downloads and unlimited skips.",
                "description": """
Spotify Premium - Music without limits.

**Ad-Free Listening** - No interruptions, ever.

**Offline Downloads** - Listen without internet.

**Unlimited Skips** - Skip as many tracks as you want.

**High Quality Audio** - Up to 320kbps streaming.

**100+ Million Tracks** - Plus podcasts and audiobooks.
                """,
                "featured": False,
                "is_bestseller": True,
                "specs": [
                    ("Duration", "12 Months"),
                    ("Audio Quality", "Up to 320kbps"),
                    ("Offline Mode", "Yes"),
                    ("Ad-Free", "Yes"),
                    ("Delivery", "Instant - Code via email"),
                ]
            },
            {
                "name": "Canva Pro Annual Subscription",
                "slug": "canva-pro-annual-subscription",
                "sku": "DIGITAL-CANVA-PRO-001",
                "price": Decimal("119.99"),
                "compare_price": Decimal("155.88"),
                "brand": "canva",
                "stock": 9999,
                "weight": None,
                "dimensions": "",
                "product_type": "digital",
                "short_description": "Premium design platform with 100+ million assets and AI tools.",
                "description": """
Canva Pro - Design anything, publish anywhere.

**100+ Million Assets** - Photos, videos, graphics, audio.

**Premium Templates** - Thousands of pro-designed templates.

**Brand Kit** - Store your logos, colors, and fonts.

**Magic Tools** - AI-powered design assistance.

**1TB Storage** - For all your designs and assets.
                """,
                "featured": True,
                "is_bestseller": False,
                "specs": [
                    ("Subscription", "12 Months"),
                    ("Premium Assets", "100+ million"),
                    ("Storage", "1TB"),
                    ("Brand Kits", "Unlimited"),
                    ("Team Features", "Up to 5 members"),
                ]
            },
        ]

        self._create_products(products, category, brands)

    # ═══════════════════════════════════════════════════════════════
    # SUMMARY
    # ═══════════════════════════════════════════════════════════════
    def print_summary(self):
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("📊 SEEDING SUMMARY"))
        self.stdout.write("=" * 60)

        self.stdout.write(f"\n  Categories:  {Category.objects.count()}")
        self.stdout.write(f"  Brands:      {Brand.objects.count()}")
        self.stdout.write(f"  Products:    {Product.objects.count()}")
        self.stdout.write(f"  Specs:       {ProductSpecification.objects.count()}")
        self.stdout.write(f"  Shipping:    {ShippingOption.objects.count()}")

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("✅ ALL DATA SEEDED SUCCESSFULLY!"))
        self.stdout.write("=" * 60 + "\n")