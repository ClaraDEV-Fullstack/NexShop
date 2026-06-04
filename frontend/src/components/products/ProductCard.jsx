// src/components/products/ProductCard.jsx

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiOutlineShoppingCart, HiStar, HiShoppingCart } from 'react-icons/hi';
import { addToCart, openCart } from '../../store/cartSlice';
import { getImageUrl } from '../../utils/helpers';
import WishlistButton from '../common/WishlistButton';
import OptimizedImage from '../common/OptimizedImage';
import toast from 'react-hot-toast';

const ProductCard = memo(({ product, priority = false }) => {
    const dispatch = useDispatch();

    // Get image URL
    const imageUrl = getImageUrl(product.primary_image);

    // Calculate discount percentage if not provided
    const discountPercentage = product.discount_percentage ||
        (product.compare_price && product.price
            ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_price)) * 100)
            : 0);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(
            addToCart({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: imageUrl,
                slug: product.slug,
            })
        );
        dispatch(openCart());
        toast.success('Added to cart!');
    };

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group flex flex-col w-full bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 sm:border-2 sm:border-gray-300 hover:border-sky-400 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 sm:hover:-translate-y-1"
        >
            {/* IMAGE CONTAINER */}
            <div className="relative w-full h-32 xs:h-36 sm:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Optimized Product Image */}
                <OptimizedImage
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
                    placeholderClassName="w-full h-full"
                    priority={priority}
                />

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top Left Badges */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 z-10">
                    {discountPercentage > 0 && (
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md">
                            -{discountPercentage}%
                        </span>
                    )}
                    {product.is_new && (
                        <span className="bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md">
                            NEW
                        </span>
                    )}
                    {product.is_bestseller && (
                        <span className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md">
                            BEST
                        </span>
                    )}
                </div>

                {/* Wishlist Button - Top Right */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-md border border-gray-100 sm:border-2">
                        <WishlistButton productId={product.id} size="sm" />
                    </div>
                </div>

                {/* Quick Add Button - Appears on hover */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.in_stock}
                        className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg ${
                            product.in_stock
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:from-blue-700 hover:to-sky-600 active:scale-[0.98]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <HiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{product.in_stock ? 'Quick Add' : 'Out of Stock'}</span>
                    </button>
                </div>

                {/* Out of Stock Overlay */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <div className="bg-white/95 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg">
                            <span className="text-gray-800 font-semibold text-xs sm:text-sm">Out of Stock</span>
                        </div>
                    </div>
                )}
            </div>

            {/* PRODUCT INFO */}
            <div className="flex flex-col p-2.5 sm:p-4 flex-1 border-t border-gray-100 sm:border-t-2 sm:border-gray-200">
                {/* Category */}
                {product.category && (
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-sky-600 font-medium mb-1 sm:mb-1.5 truncate">
                        {product.category.name}
                    </p>
                )}

                {/* Product Name */}
                <h3 className="text-xs sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {product.name}
                </h3>

                {/* Rating */}
                {product.average_rating > 0 && (
                    <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <HiStar
                                    key={i}
                                    className={`w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 ${
                                        i < Math.round(product.average_rating)
                                            ? 'text-amber-400 fill-current'
                                            : 'text-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                            ({product.review_count || 0})
                        </span>
                    </div>
                )}

                {/* Price Section */}
                <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-50 flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-base sm:text-xl font-bold text-gray-900">
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                                <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                                    ${parseFloat(product.compare_price).toFixed(2)}
                                </span>
                            )}
                        </div>
                        {discountPercentage > 0 && (
                            <span className="text-[10px] sm:text-xs text-amber-600 font-medium">
                                Save ${(parseFloat(product.compare_price) - parseFloat(product.price)).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Cart Button - Desktop only */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.in_stock}
                        className={`hidden sm:flex p-2.5 sm:p-3 rounded-lg transition-all duration-200 border-2 lg:opacity-0 lg:group-hover:opacity-100 ${
                            product.in_stock
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 border-transparent text-white hover:from-blue-700 hover:to-sky-600 shadow-md shadow-blue-500/20 active:scale-95'
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Add to cart"
                    >
                        <HiOutlineShoppingCart className="w-5 h-5" />
                    </button>
                </div>

                {/* Stock Indicator */}
                {product.in_stock && product.stock && product.stock <= 5 && (
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] sm:text-xs text-amber-600 font-medium">
                            Only {product.stock} left
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;