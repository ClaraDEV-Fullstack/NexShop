import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiOutlineHeart, HiOutlineTrash, HiOutlineShoppingCart, HiOutlineEye, HiOutlineArrowLeft } from 'react-icons/hi';
import { wishlistAPI } from '../../api/api';
import { addToCart } from '../../store/cartSlice';
import { getImageUrl, formatPrice } from '../../utils/helpers';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const DashboardWishlist = () => {
    const dispatch = useDispatch();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const response = await wishlistAPI.getAll();
            const data = response.data;
            setWishlistItems(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
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
            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (product) => {
        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: getImageUrl(product.primary_image?.image),
            slug: product.slug,
        }));
        toast.success('Added to cart!');
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
            return;
        }
        try {
            await wishlistAPI.clear();
            setWishlistItems([]);
            toast.success('Wishlist cleared');
        } catch (error) {
            toast.error('Failed to clear wishlist');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-secondary-500 hover:text-primary-500 mb-2"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">My Wishlist</h1>
                        <p className="text-secondary-500 dark:text-secondary-400">
                            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {wishlistItems.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-red-500 hover:text-red-600 text-sm font-medium px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <Link
                            to="/products"
                            className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Continue Shopping →
                        </Link>
                    </div>
                </div>

                {/* Wishlist Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden border border-secondary-100 dark:border-secondary-700">
                                <Skeleton className="w-full aspect-square" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            // Get product data from wishlist item
                            const product = item.product_details || item.product || {};
                            const productImage = getImageUrl(product.primary_image?.image || product.image);
                            const productName = product.name || 'Unknown Product';
                            const productPrice = parseFloat(product.price || 0);
                            const productSlug = product.slug || '';
                            const inStock = product.in_stock !== false && product.stock !== 0;
                            const comparePrice = product.compare_price;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden border border-secondary-100 dark:border-secondary-700 group hover:shadow-lg transition-all"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-secondary-100 dark:bg-secondary-700 overflow-hidden">
                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <HiOutlineHeart className="w-16 h-16 text-secondary-300 dark:text-secondary-600" />
                                            </div>
                                        )}

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link
                                                to={`/products/${productSlug}`}
                                                className="p-3 bg-white rounded-full hover:bg-primary-500 hover:text-white transition-colors"
                                                title="View Product"
                                            >
                                                <HiOutlineEye className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={removingId === item.id}
                                                className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                title="Remove from Wishlist"
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Remove Button (Always Visible) */}
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            disabled={removingId === item.id}
                                            className="absolute top-3 right-3 p-2 bg-white dark:bg-secondary-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                        >
                                            {removingId === item.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <HiOutlineTrash className="w-4 h-4 text-red-500" />
                                            )}
                                        </button>

                                        {/* Discount Badge */}
                                        {comparePrice && comparePrice > productPrice && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                -{Math.round((1 - productPrice / comparePrice) * 100)}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link to={`/products/${productSlug}`}>
                                            <h3 className="font-semibold text-secondary-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2 min-h-[48px]">
                                                {productName}
                                            </h3>
                                        </Link>

                                        {/* Category */}
                                        {product.category?.name && (
                                            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                                                {product.category.name}
                                            </p>
                                        )}

                                        {/* Price */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xl font-bold text-primary-500">
                                                {formatPrice(productPrice)}
                                            </span>
                                            {comparePrice && comparePrice > productPrice && (
                                                <span className="text-sm text-secondary-400 line-through">
                                                    {formatPrice(comparePrice)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        <p className={`text-sm mt-2 ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {inStock ? 'In Stock' : 'Out of Stock'}
                                        </p>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={!inStock}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                                        >
                                            <HiOutlineShoppingCart className="w-5 h-5" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-secondary-800 rounded-2xl p-12 text-center border border-secondary-100 dark:border-secondary-700">
                        <HiOutlineHeart className="w-20 h-20 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
                        <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                            Your wishlist is empty
                        </h3>
                        <p className="text-secondary-500 dark:text-secondary-400 mb-6">
                            Save items you love to your wishlist and they'll appear here.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                        >
                            Explore Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardWishlist;