// src/pages/ProductDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    HiMinus, HiPlus, HiShoppingCart, HiCheck, HiStar,
    HiChevronRight, HiHome, HiTag, HiUser, HiChatAlt2,
    HiDocumentText, HiShare, HiHeart, HiShieldCheck,
    HiTruck, HiRefresh, HiCube, HiChevronLeft
} from 'react-icons/hi';
import { productsAPI, reviewsAPI } from '../api/api';
import { addToCart, openCart } from '../store/cartSlice';
import Loader from '../components/common/Loader';
import ProductGrid from '../components/products/ProductGrid';
import StarRating from '../components/common/StarRating';
import WishlistButton from '../components/common/WishlistButton';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import { getImageUrl, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Active tab for mobile
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const response = await productsAPI.getBySlug(slug);
            setProduct(response.data);
            fetchReviews(slug, response.data.id);

            if (response.data.category) {
                const relatedRes = await productsAPI.getAll({ category: response.data.category.slug });
                const allProducts = Array.isArray(relatedRes.data) ? relatedRes.data : (relatedRes.data.results || []);
                const related = allProducts.filter(p => p.id !== response.data.id).slice(0, 4);
                setRelatedProducts(related);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviews = async (productSlug, productId) => {
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                reviewsAPI.getByProduct(productSlug),
                reviewsAPI.getProductStats(productSlug),
            ]);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []));
            setReviewStats(statsRes.data);

            if (isAuthenticated) {
                const checkRes = await reviewsAPI.checkReview(productId);
                setHasReviewed(checkRes.data.has_reviewed);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        setIsAddingToCart(true);

        let imageUrl = null;
        if (product.images && product.images.length > 0) {
            imageUrl = getImageUrl(product.images[0]);
        } else if (product.primary_image) {
            imageUrl = getImageUrl(product.primary_image);
        }

        for (let i = 0; i < quantity; i++) {
            dispatch(addToCart({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: imageUrl,
                slug: product.slug,
            }));
        }

        setTimeout(() => {
            dispatch(openCart());
            toast.success(`Added ${quantity} item(s) to cart!`);
            setIsAddingToCart(false);
        }, 300);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await reviewsAPI.create(reviewData);
            toast.success('Review submitted successfully!');
            setShowReviewForm(false);
            fetchReviews(slug, product.id);
        } catch (error) {
            const msg = error.response?.data?.product?.[0] || error.response?.data?.detail || 'Failed to submit review';
            toast.error(msg);
            throw error;
        }
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/30">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto animate-pulse">
                            <HiCube className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    </div>
                    <p className="text-gray-500 mt-4 text-xs sm:text-sm">Loading product details...</p>
                </div>
            </div>
        );
    }

    // Not Found State
    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-primary-50/30">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <HiTag className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">Product Not Found</h1>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm">This product doesn't exist or has been removed.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
                    >
                        <HiChevronLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare images array
    const images = [];
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            const imgUrl = getImageUrl(img);
            if (imgUrl && !images.find(i => i.image === imgUrl)) {
                images.push({
                    image: imgUrl,
                    alt: img.alt_text || product.name
                });
            }
        });
    }
    if (images.length === 0) {
        images.push({
            image: '/placeholder-product.jpg',
            alt: product.name
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
            {/* Breadcrumb */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-2 sm:py-2.5">
                    <nav className="text-[10px] sm:text-xs md:text-sm">
                        <ol className="flex items-center gap-1 sm:gap-1.5 text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            <li>
                                <Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors p-1">
                                    <HiHome className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden xs:inline">Home</span>
                                </Link>
                            </li>
                            <HiChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            <li>
                                <Link to="/products" className="hover:text-primary-600 transition-colors p-1">Products</Link>
                            </li>
                            {product.category && (
                                <>
                                    <HiChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                    <li>
                                        <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-600 transition-colors p-1">
                                            {product.category.name}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <HiChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            <li className="text-gray-800 font-medium truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs">{product.name}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-3 sm:py-4 md:py-6 lg:py-8">

                {/* Product Detail Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 md:mb-12">

                    {/* Images Section */}
                    <div className="space-y-2 sm:space-y-3">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                            {images[selectedImage]?.image ? (
                                <img
                                    src={images[selectedImage].image}
                                    alt={images[selectedImage].alt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                                    <HiCube className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                                </div>
                            )}

                            {/* Image Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                    </button>
                                </>
                            )}

                            {/* Badges Container */}
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5">
                                {product.discount_percentage > 0 && (
                                    <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg">
                                        -{product.discount_percentage}% OFF
                                    </span>
                                )}
                                {product.is_new && (
                                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg">
                                        NEW
                                    </span>
                                )}
                                {product.is_bestseller && (
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg">
                                        BESTSELLER
                                    </span>
                                )}
                            </div>

                            {/* Share & Wishlist - Desktop */}
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
                                <button className="w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all">
                                    <HiShare className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            {/* Image Counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                    {selectedImage + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                            selectedImage === idx
                                                ? 'border-primary-500 ring-2 ring-primary-200 scale-105 shadow-md'
                                                : 'border-gray-200 hover:border-primary-300 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img.image} alt={img.alt} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust Badges - Mobile Only */}
                        <div className="grid grid-cols-3 gap-2 lg:hidden mt-2">
                            {[
                                { icon: HiTruck, label: 'Free Shipping', sub: 'Orders $50+' },
                                { icon: HiShieldCheck, label: 'Secure', sub: 'Checkout' },
                                { icon: HiRefresh, label: 'Easy', sub: 'Returns' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-lg p-2 text-center">
                                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 mx-auto mb-0.5" />
                                    <p className="text-[9px] sm:text-[10px] font-medium text-gray-800">{item.label}</p>
                                    <p className="text-[8px] sm:text-[9px] text-gray-500">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* Category Badge */}
                        {product.category && (
                            <Link
                                to={`/products?category=${product.category.slug}`}
                                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full transition-colors font-medium"
                            >
                                <HiTag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {product.category.name}
                            </Link>
                        )}

                        {/* Product Name */}
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating & Reviews */}
                        {reviewStats && reviewStats.total_reviews > 0 && (
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                    <HiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-current" />
                                    <span className="text-xs sm:text-sm font-bold text-amber-700">{reviewStats.average_rating}</span>
                                </div>
                                <span className="text-[10px] sm:text-xs text-gray-500 underline underline-offset-2">
                                    {reviewStats.total_reviews} {reviewStats.total_reviews === 1 ? 'review' : 'reviews'}
                                </span>
                            </button>
                        )}

                        {/* Price Section */}
                        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 py-2 sm:py-3 border-y border-gray-100">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
                                {formatPrice(product.price)}
                            </span>
                            {product.compare_price && (
                                <>
                                    <span className="text-base sm:text-lg md:text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                                    <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        Économie {formatPrice(product.compare_price - product.price)}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Short Description */}
                        {product.short_description && (
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {product.short_description}
                            </p>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {product.in_stock ? (
                                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium border border-emerald-100">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span>In Stock</span>
                                    <span className="text-emerald-600">• {product.stock} available</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium border border-red-100">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                                    Out of Stock
                                </div>
                            )}
                        </div>

                        {/* Variants selector */}
                        {product.variants && product.variants.length > 0 && (() => {
                            // Group by variant name (e.g., Size, Color)
                            const groups = product.variants.reduce((acc, v) => {
                                if (!acc[v.name]) acc[v.name] = [];
                                acc[v.name].push(v);
                                return acc;
                            }, {});
                            return (
                                <div className="pt-2 space-y-3">
                                    {Object.entries(groups).map(([name, options]) => (
                                        <div key={name}>
                                            <p className="text-sm font-medium text-gray-700 mb-1.5">
                                                {name}
                                                {selectedVariant?.name === name && (
                                                    <span className="ml-2 text-gray-500 font-normal">— {selectedVariant.value}</span>
                                                )}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {options.map(v => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        disabled={!v.is_available || v.stock === 0}
                                                        onClick={() => setSelectedVariant(
                                                            selectedVariant?.id === v.id ? null : v
                                                        )}
                                                        className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all
                                                            ${selectedVariant?.id === v.id
                                                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'}
                                                            ${(!v.is_available || v.stock === 0) ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                                                    >
                                                        {v.value}
                                                        {v.price_adjustment !== 0 && (
                                                            <span className="ml-1 text-xs">
                                                                ({v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment})
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col gap-2 sm:gap-3 pt-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Quantity Selector */}
                                <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                    <span className="px-3 sm:px-4 md:px-5 font-bold text-sm sm:text-base md:text-lg min-w-[2rem] sm:min-w-[2.5rem] text-center text-gray-800">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                        className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.in_stock || isAddingToCart}
                                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-bold py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base active:scale-[0.98]"
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span className="hidden xs:inline">Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Add to Cart</span>
                                        </>
                                    )}
                                </button>

                                {/* Wishlist Button - Desktop */}
                                <div className="hidden sm:block">
                                    <WishlistButton productId={product.id} size="md" />
                                </div>
                            </div>

                            {/* Mobile Wishlist & Share */}
                            <div className="flex sm:hidden gap-2">
                                <WishlistButton productId={product.id} size="sm" className="flex-1" />
                                <button className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium text-gray-600">
                                    <HiShare className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* SKU & Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                                SKU: <span className="text-gray-700 font-medium">{product.sku}</span>
                            </span>
                            {product.category && (
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                    Category: <span className="text-gray-700 font-medium">{product.category.name}</span>
                                </span>
                            )}
                        </div>

                        {/* Trust Badges - Desktop */}
                        <div className="hidden lg:grid grid-cols-3 gap-2 pt-3">
                            {[
                                { icon: HiTruck, label: 'Free Shipping', desc: 'On orders $50+', color: 'primary' },
                                { icon: HiShieldCheck, label: 'Secure Checkout', desc: '256-bit SSL', color: 'emerald' },
                                { icon: HiRefresh, label: 'Easy Returns', desc: '30-day policy', color: 'amber' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                                    <item.icon className={`w-5 h-5 text-${item.color}-500 mx-auto mb-1`} />
                                    <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mb-6 sm:mb-8 md:mb-12">
                    {/* Tab Headers */}
                    <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-lg sm:rounded-xl mb-3 sm:mb-4 overflow-x-auto gap-1 sticky top-12 z-10">
                        {[
                            { id: 'description', label: 'Description', mobileLabel: 'Details', icon: HiDocumentText },
                            { id: 'reviews', label: `Reviews (${reviewStats?.total_reviews || 0})`, mobileLabel: `Reviews (${reviewStats?.total_reviews || 0})`, icon: HiChatAlt2 },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">{tab.label}</span>
                                <span className="xs:hidden">{tab.mobileLabel}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div>
                                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                    </div>
                                    Product Description
                                </h2>
                                <div className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                    <p className="whitespace-pre-line">{product.description}</p>
                                </div>

                                {/* Specifications */}
                                {product.specifications?.length > 0 && (
                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Specifications</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                            {product.specifications.map((spec, idx) => (
                                                <div key={idx} className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                                                    <span className="text-gray-500">{spec.name}</span>
                                                    <span className="font-medium text-gray-900">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div>
                                {/* Review Header */}
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                            <HiChatAlt2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                        </div>
                                        Customer Reviews
                                    </h2>
                                    {isAuthenticated && !hasReviewed && !showReviewForm && (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="bg-gradient-to-r from-primary-600 to-primary-600 text-white text-[10px] sm:text-xs md:text-sm font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:from-primary-700 hover:to-primary-700 transition-all shadow-md"
                                        >
                                            Write a Review
                                        </button>
                                    )}
                                </div>

                                {/* Rating Summary */}
                                {reviewStats && reviewStats.total_reviews > 0 && (
                                    <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 border border-primary-100">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
                                            {/* Average Rating */}
                                            <div className="text-center sm:pr-4 md:pr-6 sm:border-r border-primary-200">
                                                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent mb-1">
                                                    {reviewStats.average_rating}
                                                </div>
                                                <StarRating rating={Math.round(reviewStats.average_rating)} readonly size="sm" />
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{reviewStats.total_reviews} reviews</p>
                                            </div>

                                            {/* Rating Distribution */}
                                            <div className="flex-1 space-y-1 sm:space-y-1.5">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = reviewStats.rating_distribution?.[star] || 0;
                                                    const percentage = reviewStats.total_reviews ? (count / reviewStats.total_reviews) * 100 : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-1.5 sm:gap-2">
                                                            <span className="text-[10px] sm:text-xs text-gray-600 w-3">{star}</span>
                                                            <HiStar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-400 fill-current" />
                                                            <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] sm:text-xs text-gray-500 w-4 sm:w-5 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Review Form */}
                                {showReviewForm && (
                                    <div className="mb-4 sm:mb-6">
                                        <ReviewForm
                                            productId={product.id}
                                            onSubmit={handleSubmitReview}
                                            onCancel={() => setShowReviewForm(false)}
                                        />
                                    </div>
                                )}

                                {/* Login Prompt */}
                                {!isAuthenticated && (
                                    <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 text-center border border-primary-100">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <HiUser className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                                        </div>
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1">Login to Review</h3>
                                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-3 sm:mb-4">Please login to write a review for this product.</p>
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-md"
                                        >
                                            Login
                                            <HiChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}

                                {/* Already Reviewed */}
                                {isAuthenticated && hasReviewed && !showReviewForm && (
                                    <div className="bg-primary-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-primary-100">
                                        <p className="text-primary-700 flex items-center gap-2 text-xs sm:text-sm">
                                            <HiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                            You have already reviewed this product.
                                        </p>
                                    </div>
                                )}

                                {/* Reviews List */}
                                <ReviewList
                                    reviews={reviews}
                                    productId={product.id}
                                    onReviewChange={() => fetchReviews(slug, product.id)}
                                />

                                {/* No Reviews */}
                                {(!reviews || reviews.length === 0) && (
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <HiChatAlt2 className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <HiTag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">You May Also Like</h2>
                            </div>
                            <Link
                                to={`/products?category=${product.category?.slug}`}
                                className="text-[10px] sm:text-xs md:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:gap-1.5 transition-all"
                            >
                                View All
                                <HiChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Link>
                        </div>
                        <ProductGrid products={relatedProducts} isLoading={false} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;