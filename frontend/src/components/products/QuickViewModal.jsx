import { useState } from 'react';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { HiX, HiHeart, HiOutlineHeart, HiShoppingCart, HiMinus, HiPlus, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onToggleWishlist, isInWishlist }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        toast.success(`Added ${quantity} item(s) to cart!`);
        setQuantity(1);
    };

    const images = product.images?.length > 0
        ? product.images
        : [{ image: product.image || '/placeholder.jpg' }];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative w-full max-w-4xl bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-secondary-700/90 hover:bg-white dark:hover:bg-secondary-600 rounded-full shadow-lg transition-all"
                    >
                        <HiX className="w-6 h-6 text-secondary-700 dark:text-secondary-200" />
                    </button>

                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative bg-secondary-100 dark:bg-secondary-700 p-8">
                            {/* Main Image */}
                            <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                                <img
                                    src={images[selectedImage]?.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="flex gap-2 justify-center">
                                    {images.slice(0, 4).map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? 'border-primary-500 scale-105'
                                                    : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={img.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Discount Badge */}
                            {product.discount_percent > 0 && (
                                <div className="absolute top-12 left-12 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{product.discount_percent}%
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex flex-col">
                            {/* Category */}
                            <span className="text-sm text-primary-500 font-medium mb-2">
                                {product.category?.name || 'Product'}
                            </span>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
                                {product.name}
                            </h2>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <HiStar
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(product.average_rating || 0)
                                                    ? 'text-yellow-400'
                                                    : 'text-secondary-300 dark:text-secondary-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-secondary-500 dark:text-secondary-400 text-sm">
                                    ({product.review_count || 0} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl font-bold text-primary-500">
                                    {formatPrice(product.price)}
                                </span>
                                {product.compare_price && product.compare_price > product.price && (
                                    <span className="text-xl text-secondary-400 line-through">
                                        {formatPrice(product.compare_price)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-secondary-600 dark:text-secondary-400 mb-6 line-clamp-3">
                                {product.description || 'No description available.'}
                            </p>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-secondary-700 dark:text-secondary-300 font-medium">Quantity:</span>
                                <div className="flex items-center border border-secondary-200 dark:border-secondary-600 rounded-xl">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <HiMinus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-semibold text-secondary-900 dark:text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                        className="p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                                        disabled={quantity >= (product.stock || 10)}
                                    >
                                        <HiPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-auto">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                                >
                                    <HiShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => onToggleWishlist(product)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        isInWishlist
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                                            : 'border-secondary-200 dark:border-secondary-600 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-400 hover:text-red-500'
                                    }`}
                                >
                                    {isInWishlist ? (
                                        <HiHeart className="w-6 h-6" />
                                    ) : (
                                        <HiOutlineHeart className="w-6 h-6" />
                                    )}
                                </button>
                            </div>

                            {/* View Full Details Link */}
                            <Link
                                to={`/products/${product.slug}`}
                                onClick={onClose}
                                className="mt-4 text-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
                            >
                                View Full Details →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;