// src/pages/Wishlist.jsx

import { useState, useEffect } from 'react';
import { formatPrice } from '../utils/helpers';
import { Link } from 'react-router-dom';
import {
    HiHeart,
    HiTrash,
    HiShoppingCart,
    HiOutlineShoppingBag,
    HiOutlineHeart,
    HiCube,
    HiExclamation
} from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import { wishlistAPI, productsAPI } from '../api/api';
import { addToCart, openCart } from '../store/cartSlice';
import { getImageUrl } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// Wishlist Item Image Component
const WishlistItemImage = ({ product }) => {
    const [hasError, setHasError] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (!product) {
            setImageUrl(null);
            return;
        }

        let url = null;

        // Try different image sources
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            url = getImageUrl(product.images[0]);
        }

        if (!url && product.primary_image) {
            url = getImageUrl(product.primary_image);
            if (!url && product.primary_image.image) {
                url = getImageUrl(product.primary_image.image);
            }
        }

        if (!url && product.image) {
            url = getImageUrl(product.image);
        }

        if (!url && product.product_image) {
            url = getImageUrl(product.product_image);
        }

        if (!url && product.thumbnail) {
            url = getImageUrl(product.thumbnail);
        }

        setImageUrl(url);
        setHasError(false);
    }, [product]);

    if (!imageUrl || hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-50">
                <HiCube className="w-10 h-10 text-primary-300" />
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={product?.name || 'Product'}
            className="w-full h-full object-cover object-center"
            onError={() => setHasError(true)}
        />
    );
};

const Wishlist = () => {
    const dispatch = useDispatch();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [addingToCartId, setAddingToCartId] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const getProductImageUrl = (product) => {
        if (!product) return null;
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return getImageUrl(product.images[0]);
        }
        if (product.primary_image) {
            return getImageUrl(product.primary_image);
        }
        if (product.image) {
            return getImageUrl(product.image);
        }
        return null;
    };

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.getAll();
            const data = response.data;
            let wishlistItems = Array.isArray(data) ? data : (data.results || []);

            // Enrich items with full product details if needed
            const enrichedItems = await Promise.all(
                wishlistItems.map(async (item) => {
                    const product = item.product_details || item.product;
                    const hasImages = product && (
                        (product.images && product.images.length > 0) ||
                        product.primary_image ||
                        product.image
                    );

                    if (!hasImages && product?.slug) {
                        try {
                            const productRes = await productsAPI.getBySlug(product.slug);
                            return { ...item, product_details: productRes.data };
                        } catch (err) {
                            console.error('Failed to fetch product:', err);
                        }
                    }
                    return item;
                })
            );

            setItems(enrichedItems);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId) => {
        setRemovingId(itemId);
        try {
            await wishlistAPI.remove(itemId);
            setItems(items.filter(item => item.id !== itemId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (product, itemId) => {
        if (!product) return;

        setAddingToCartId(itemId);

        setTimeout(() => {
            dispatch(addToCart({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: getProductImageUrl(product),
                slug: product.slug,
            }));
            dispatch(openCart());
            toast.success('Added to cart!');
            setAddingToCartId(null);
        }, 300);
    };

    const handleClearAll = async () => {
        try {
            await wishlistAPI.clear();
            setItems([]);
            toast.success('Wishlist cleared');
            setShowClearConfirm(false);
        } catch (error) {
            toast.error('Failed to clear wishlist');
        }
    };

    const getProduct = (item) => {
        return item.product_details || item.product || item;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-50">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <Loader size="lg" />
                    </div>
                    <p className="text-gray-500 font-medium">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-50 py-8">
            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-primary-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <HiExclamation className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Clear Wishlist?</h3>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            All {items.length} item{items.length !== 1 ? 's' : ''} will be removed from your wishlist. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                    <HiHeart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
                                    <p className="text-gray-500 text-sm">Save your favorite items for later</p>
                                </div>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <HiTrash className="w-4 h-4" />
                                <span className="font-medium">Clear All</span>
                            </button>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                {items.length} item{items.length !== 1 ? 's' : ''} saved
                            </span>
                        </div>
                    )}
                </div>

                {items.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-primary-100">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiOutlineHeart className="w-12 h-12 text-primary-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Save items you love to your wishlist by clicking the heart icon. They'll appear here so you can find them easily.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25"
                        >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    /* Wishlist Items Grid */
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">

                        {items.map((item) => {
                            const product = getProduct(item);

                            if (!product || typeof product === 'number') {
                                return (
                                    <div key={item.id} className="bg-white rounded-2xl shadow-md p-5 border border-red-200">
                                        <p className="text-red-500 text-sm">
                                            Product data not available
                                        </p>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="mt-2 text-red-500 text-sm underline hover:text-red-600"
                                        >
                                            Remove from wishlist
                                        </button>
                                    </div>
                                );
                            }

                            const isInStock = product.in_stock !== false && product.stock !== 0;
                            const hasDiscount = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-primary-100 group"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image Container */}
                                        <Link
                                            to={`/products/${product.slug}`}
                                            className="relative w-full sm:w-40 md:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-50"
                                        >
                                            <div className="absolute inset-0">
                                                <WishlistItemImage product={product} />
                                            </div>

                                            {/* Image Overlay on Hover */}
                                            <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-300"></div>

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                {hasDiscount && (
                                                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                                                        {Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_price)) * 100)}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wishlist Heart Badge */}
                                            <div className="absolute top-3 right-3">
                                                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                                                    <HiHeart className="w-4 h-4 text-red-500" />
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex-1 p-4 sm:p-5 flex flex-col">
                                            <div className="flex-1">
                                                {/* Category */}
                                                {product.category && (
                                                    <p className="text-xs text-primary-600 font-medium mb-1.5 uppercase tracking-wide">
                                                        {typeof product.category === 'string'
                                                            ? product.category
                                                            : product.category.name}
                                                    </p>
                                                )}

                                                {/* Product Name */}
                                                <Link
                                                    to={`/products/${product.slug}`}
                                                    className="block font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2 text-base sm:text-lg"
                                                >
                                                    {product.name}
                                                </Link>

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xl sm:text-2xl font-bold text-primary-600">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {formatPrice(product.compare_price)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                <div className="mb-4">
                                                    {isInStock ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 sm:gap-3">
                                                <button
                                                    onClick={() => handleAddToCart(product, item.id)}
                                                    disabled={!isInStock || addingToCartId === item.id}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                                >
                                                    {addingToCartId === item.id ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>Adding...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiShoppingCart className="w-4 h-4" />
                                                            <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={removingId === item.id}
                                                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 flex-shrink-0"
                                                    title="Remove from wishlist"
                                                >
                                                    {removingId === item.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <HiTrash className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Continue Shopping Link */}
                {items.length > 0 && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl border-2 border-primary-600 hover:bg-primary-50 transition-all"
                        >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;