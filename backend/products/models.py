from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Category(models.Model):
    """Product categories with optional parent for nesting"""

    ICON_CHOICES = [
        ('laptop', 'Electronics'),
        ('shirt', 'Fashion'),
        ('home', 'Home & Living'),
        ('sparkles', 'Beauty & Skincare'),
        ('book-open', 'Books & Education'),
        ('fire', 'Sports & Fitness'),
        ('puzzle', 'Kids & Toys'),
        ('cloud-download', 'Digital Products'),
        ('tag', 'General'),
    ]

    name = models.CharField(
        max_length=100,
        # REMOVED unique=True - allow same names under different parents
        help_text="Category name (e.g., Electronics, Fashion)"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,  # Slug stays unique
        help_text="URL-friendly name (e.g., electronics, fashion)"
    )
    description = models.TextField(
        blank=True,
        help_text="Brief description of this category"
    )
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True,
        help_text="Category banner image (recommended: 800x400px)"
    )
    icon = models.CharField(
        max_length=50,
        choices=ICON_CHOICES,
        default='tag',
        help_text="Icon for category display"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='children',
        help_text="Parent category (leave empty for top-level category)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck to hide this category from the store"
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Order in which category appears (lower = first)"
    )
    featured = models.BooleanField(
        default=False,
        help_text="Show on homepage"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
        # Add unique together constraint for name + parent
        unique_together = ['name', 'parent']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name

    @property
    def full_path(self):
        """Get full category path (e.g., Electronics > Smartphones)"""
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name


class Brand(models.Model):
    """Product brands"""

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Brand name (e.g., Apple, Nike, Samsung)"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text="URL-friendly name"
    )
    logo = models.ImageField(
        upload_to='brands/',
        blank=True,
        null=True,
        help_text="Brand logo (recommended: 200x200px)"
    )
    description = models.TextField(
        blank=True,
        help_text="Brief description of this brand"
    )
    website = models.URLField(
        blank=True,
        help_text="Official brand website"
    )
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Show on homepage"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model with pricing and inventory"""

    PRODUCT_TYPE_CHOICES = [
        ('physical', 'Physical Product'),
        ('digital', 'Digital Product'),
    ]

    name = models.CharField(
        max_length=255,
        help_text="Product name (e.g., iPhone 15 Pro Max 256GB)"
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        help_text="URL-friendly name (e.g., iphone-15-pro-max-256gb)"
    )
    description = models.TextField(
        help_text="Full product description (features, specifications, etc.)"
    )
    short_description = models.CharField(
        max_length=500,
        blank=True,
        help_text="Brief description for product cards (1-2 sentences)"
    )
    product_type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPE_CHOICES,
        default='physical',
        help_text="Physical products are shipped, digital products are downloaded"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Current selling price (e.g., 999.99)"
    )
    compare_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Original price before discount (leave empty if no discount)"
    )
    sku = models.CharField(
        max_length=100,
        unique=True,
        help_text="Stock Keeping Unit - unique product code (e.g., IPHONE-15-256-BLK)"
    )
    stock = models.PositiveIntegerField(
        default=0,
        help_text="Number of items available in inventory"
    )
    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        help_text="Alert when stock falls below this number"
    )
    is_available = models.BooleanField(
        default=True,
        help_text="Uncheck to hide this product from the store"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        help_text="Select the product category"
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text="Select the product brand"
    )
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Weight in kg (for shipping calculation)"
    )
    dimensions = models.CharField(
        max_length=100,
        blank=True,
        help_text="Dimensions (e.g., 10x5x2 cm)"
    )
    meta_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="SEO title (defaults to product name)"
    )
    meta_description = models.CharField(
        max_length=500,
        blank=True,
        help_text="SEO description (defaults to short description)"
    )
    featured = models.BooleanField(
        default=False,
        help_text="Check to show this product on the homepage"
    )
    is_new = models.BooleanField(
        default=True,
        help_text="Show 'New' badge on product"
    )
    is_bestseller = models.BooleanField(
        default=False,
        help_text="Show 'Bestseller' badge on product"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0 and self.is_available

    @property
    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold and self.stock > 0

    @property
    def discount_percentage(self):
        if self.compare_price and self.compare_price > self.price:
            discount = ((self.compare_price - self.price) / self.compare_price) * 100
            return round(discount, 0)
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        help_text="Select the product this image belongs to"
    )
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        help_text="Image description for accessibility (e.g., iPhone 15 front view)"
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Check to use as main product thumbnail"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Display order (0 = first, 1 = second, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-is_primary']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)



class ProductSpecification(models.Model):
    """Product specifications (key-value pairs)"""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='specifications'
    )
    name = models.CharField(
        max_length=100,
        help_text="Specification name (e.g., Screen Size, RAM, Material)"
    )
    value = models.CharField(
        max_length=255,
        help_text="Specification value (e.g., 6.7 inches, 8GB, Cotton)"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"


class ShippingOption(models.Model):
    """Shipping options available for orders"""

    name = models.CharField(
        max_length=100,
        help_text="Shipping method name (e.g., Standard Shipping)"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of shipping method"
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Shipping cost"
    )
    estimated_days_min = models.PositiveIntegerField(
        default=3,
        help_text="Minimum delivery days"
    )
    estimated_days_max = models.PositiveIntegerField(
        default=7,
        help_text="Maximum delivery days"
    )
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(
        default=False,
        help_text="Default shipping option"
    )
    free_shipping_threshold = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Order amount for free shipping (leave empty if not applicable)"
    )
    regions = models.CharField(
        max_length=500,
        default='worldwide',
        help_text="Comma-separated country codes or 'worldwide'"
    )
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'price']

    def __str__(self):
        return f"{self.name} - ${self.price} ({self.estimated_days_min}-{self.estimated_days_max} days)"

    @property
    def delivery_estimate(self):
        if self.estimated_days_min == self.estimated_days_max:
            return f"{self.estimated_days_min} days"
        return f"{self.estimated_days_min}-{self.estimated_days_max} days"


class ProductVariant(models.Model):
    """Size, color, or any other product variant with its own stock and optional price delta."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    name = models.CharField(
        max_length=50,
        help_text="Variant type, e.g. Size, Color",
    )
    value = models.CharField(
        max_length=100,
        help_text="Variant value, e.g. XL, Red",
    )
    sku = models.CharField(max_length=100, unique=True)
    price_adjustment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Amount added to (positive) or subtracted from (negative) the base price",
    )
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name', 'value']
        unique_together = ['product', 'name', 'value']

    def __str__(self):
        return f"{self.product.name} — {self.name}: {self.value}"

    @property
    def final_price(self):
        return self.product.price + self.price_adjustment