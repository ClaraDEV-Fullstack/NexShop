// src/pages/Home.jsx

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import {
    HiArrowRight,
    HiShoppingBag,
    HiTruck,
    HiShieldCheck,
    HiCreditCard,
    HiSparkles,
    HiLightningBolt,
    HiStar,
    HiTag,
    HiHeart,
    HiGift
} from 'react-icons/hi';
import { productsAPI, categoriesAPI } from '../api/api';
import ProductCard from '../components/products/ProductCard';

// ========== PRODUCT SECTION SKELETON LOADER ==========
const ProductSectionSkeleton = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 animate-pulse"
                >
                    {/* Image Skeleton */}
                    <div className="relative h-32 sm:h-40 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-700 dark:to-secondary-800">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
                    </div>
                    {/* Content Skeleton */}
                    <div className="p-3 space-y-2">
                        <div className="h-3 w-16 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
                        <div className="h-4 w-full bg-secondary-200 dark:bg-secondary-700 rounded" />
                        <div className="h-4 w-3/4 bg-secondary-200 dark:bg-secondary-700 rounded" />
                        <div className="flex gap-0.5 pt-1">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="w-3 h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-secondary-100 dark:border-secondary-700">
                            <div className="h-5 w-16 bg-secondary-200 dark:bg-secondary-700 rounded" />
                            <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ========== CATEGORY SKELETON LOADER ==========
const CategorySkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 md:gap-3">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-secondary-800 rounded-lg sm:rounded-xl p-2 sm:p-3 animate-pulse"
                >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto rounded-lg bg-secondary-200 dark:bg-secondary-700 mb-1 sm:mb-2" />
                    <div className="h-2 sm:h-3 w-full bg-secondary-200 dark:bg-secondary-700 rounded mx-auto" />
                </div>
            ))}
        </div>
    );
};

// ========== INLINE LOADING SPINNER FOR SECTIONS ==========
const SectionLoader = () => {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-3 border-primary-200 dark:border-primary-800"></div>
                    <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-600 animate-spin"></div>
                </div>
                <span className="text-xs text-secondary-500">Loading...</span>
            </div>
        </div>
    );
};

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestsellers, setBestsellers] = useState([]);
    const [onSale, setOnSale] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // All 4 product endpoints now return one product per category
                // (offset 0,1,2,3) so there are ZERO duplicates across sections
                const [catResp, featResp, newResp, bestResp, saleResp] = await Promise.all([
                    categoriesAPI.getFeatured(),
                    productsAPI.getFeatured(),
                    productsAPI.getNewArrivals(),
                    productsAPI.getBestsellers(),
                    productsAPI.getOnSale(),
                ]);

                setCategories(catResp.data?.results || catResp.data || []);
                setFeaturedProducts(featResp.data?.results || featResp.data || []);
                setNewArrivals(newResp.data?.results || newResp.data || []);
                setBestsellers(bestResp.data?.results || bestResp.data || []);
                setOnSale(saleResp.data?.results || saleResp.data || []);
            } catch (err) {
                console.error('Home page load error:', err);
            } finally {
                setCategoriesLoading(false);
                setProductsLoading(false);
            }
        };
        load();
    }, []);

    const getCategoryIcon = (category) => {
        const slugMap = {
            'electronics': '💻',
            'fashion': '👗',
            'home-living': '🏠',
            'beauty-skincare': '✨',
            'books-education': '📚',
            'sports-fitness': '🏃',
            'kids-toys': '🧸',
            'digital-products': '📱',
        };
        return slugMap[category.slug] || '🏷️';
    };

    const getCategoryColor = (category) => {
        const slugColorMap = {
            'electronics': 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20',
            'fashion': 'from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20',
            'home-living': 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20',
            'beauty-skincare': 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20',
            'books-education': 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
            'sports-fitness': 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20',
            'kids-toys': 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20',
            'digital-products': 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20',
        };
        return slugColorMap[category.slug] || 'from-gray-100 to-gray-50 dark:from-gray-900/30 dark:to-gray-800/20';
    };

    return (
        <div className="min-h-screen">
            {/* ==================== HERO SECTION ==================== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-primary-700 to-primary-900 text-white">

                {/* ── Background texture ── */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />

                {/* ── Animated blobs ── */}
                <motion.div animate={{ scale: [1,1.15,1], x:[0,25,0] }} transition={{ duration: 18, repeat: Infinity, ease:"easeInOut" }}
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-yellow-400/25 to-orange-500/15 blur-3xl pointer-events-none" />
                <motion.div animate={{ scale: [1,1.2,1], y:[0,30,0] }} transition={{ duration: 22, repeat: Infinity, ease:"easeInOut" }}
                    className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-violet-500/20 to-pink-500/10 blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none hidden lg:block" />

                {/* ── MAIN GRID ── */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[55%_45%] min-h-[92vh] lg:min-h-[88vh] items-center gap-0">

                        {/* ─────── LEFT: TEXT ─────── */}
                        <div className="flex flex-col justify-center py-16 sm:py-20 lg:py-24 xl:py-28 order-2 lg:order-1 text-center lg:text-left px-0 lg:pr-10 xl:pr-16">

                            {/* Live badge */}
                            <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
                                className="inline-flex justify-center lg:justify-start mb-5 sm:mb-6">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs sm:text-sm font-medium border border-white/20 shadow-lg">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                                    </span>
                                    🚚 Free shipping on orders over $50
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1 initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.1 }}
                                className="font-extrabold leading-[1.08] tracking-tight mb-5 sm:mb-6">
                                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white drop-shadow-sm">
                                    Discover Your
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl mt-1 sm:mt-2">
                                    <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                                        Perfect Style
                                    </span>
                                </span>
                                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl mt-2 sm:mt-3 text-white/60 font-semibold">
                                    Shop Smarter, Live Better
                                </span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.2 }}
                                className="text-sm sm:text-base lg:text-lg text-white/75 mb-7 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                                Premium products across every category — Electronics, Fashion, Beauty, Home & more.
                                Unbeatable prices, fast delivery, 100% secure checkout.
                            </motion.p>

                            {/* Category pills */}
                            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.25 }}
                                className="flex flex-wrap gap-2 justify-center lg:justify-start mb-7 sm:mb-8">
                                {[
                                    { label:'Electronics', emoji:'💻' },
                                    { label:'Fashion', emoji:'👗' },
                                    { label:'Beauty', emoji:'✨' },
                                    { label:'Home', emoji:'🏠' },
                                    { label:'Sports', emoji:'🏃' },
                                ].map((c) => (
                                    <Link key={c.label} to={`/products?category=${c.label.toLowerCase()}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-medium transition-all hover:scale-105">
                                        <span>{c.emoji}</span>{c.label}
                                    </Link>
                                ))}
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.3 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 justify-center lg:justify-start">
                                <Link to="/products"
                                    className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white text-primary-800 font-bold rounded-2xl hover:bg-amber-400 hover:text-primary-900 transition-all duration-300 shadow-2xl shadow-black/25 hover:shadow-amber-400/40 hover:scale-[1.03] text-sm sm:text-base">
                                    <HiShoppingBag className="w-5 h-5" />
                                    Shop Now
                                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/products?on_sale=true"
                                    className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/25 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-[1.03] text-sm sm:text-base">
                                    <HiTag className="w-5 h-5" />
                                    View Deals
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.4 }}
                                className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 lg:gap-10 mb-6 lg:mb-0">
                                {[
                                    { value:'50K+', label:'Happy Customers' },
                                    { value:'40+', label:'Product Categories' },
                                    { value:'4.9★', label:'Avg. Rating' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center lg:text-left">
                                        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{s.value}</div>
                                        <div className="text-[11px] sm:text-xs text-white/55 mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Trust row – desktop only */}
                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}
                                className="hidden lg:flex items-center gap-6 mt-8 pt-7 border-t border-white/10">
                                {[
                                    { icon: HiTruck, text: 'Free Shipping $50+' },
                                    { icon: HiShieldCheck, text: 'Secure Payment' },
                                    { icon: HiCreditCard, text: '30-Day Returns' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-white/65 text-sm">
                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                        {item.text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* ─────── RIGHT: IMAGE ─────── */}
                        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, delay:0.15 }}
                            className="relative order-1 lg:order-2 flex items-stretch self-stretch min-h-[280px] sm:min-h-[360px] md:min-h-[440px] lg:min-h-0">

                            {/* Glow behind image */}
                            <div className="absolute inset-4 bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-pink-500/20 rounded-3xl blur-2xl" />

                            {/* Image frame */}
                            <div className="relative w-full lg:ml-6 xl:ml-10 my-8 sm:my-10 lg:my-10 xl:my-12 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.5)]">
                                <img
                                    src="/images/hero-shopping.jpg"
                                    alt="Premium Shopping Experience"
                                    fetchPriority="high"
                                    loading="eager"
                                    className="w-full h-full object-cover object-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-full"
                                />
                                {/* Gradient overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-800/20 via-transparent to-transparent" />

                                {/* Floating badge — bottom left */}
                                <motion.div
                                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                                    transition={{ delay:0.9, type:"spring", stiffness:120 }}
                                    whileHover={{ scale:1.05, y:-4 }}
                                    className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 bg-white rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center gap-3">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 flex-shrink-0">
                                        <HiGift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Limited Offer</p>
                                        <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">Up to 50% OFF</p>
                                    </div>
                                </motion.div>

                                {/* Floating badge — top right */}
                                <motion.div
                                    initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                                    transition={{ delay:1.05, type:"spring", stiffness:120 }}
                                    whileHover={{ scale:1.05 }}
                                    className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        {[...Array(5)].map((_,i) => (
                                            <HiStar key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                                        ))}
                                        <span className="text-sm sm:text-base font-extrabold text-gray-900 ml-1">4.9</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-400">2.5k+ verified reviews</p>
                                </motion.div>

                                {/* Floating icon — mid right (desktop) */}
                                <motion.div
                                    initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                                    transition={{ delay:1.2, type:"spring", stiffness:180 }}
                                    whileHover={{ scale:1.15, rotate:8 }}
                                    className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-5 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl items-center justify-center shadow-xl shadow-rose-500/35">
                                    <HiHeart className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                </motion.div>

                                {/* Floating icon — mid left (desktop) */}
                                <motion.div
                                    initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                                    transition={{ delay:1.35, type:"spring", stiffness:180 }}
                                    whileHover={{ scale:1.15, rotate:-8 }}
                                    className="hidden md:flex absolute top-1/3 left-5 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl items-center justify-center shadow-xl shadow-amber-500/35">
                                    <HiSparkles className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Wave divider ── */}
                <div className="absolute -bottom-1 left-0 right-0 z-20 pointer-events-none">
                    <svg viewBox="0 0 1440 80" fill="none" className="w-full h-10 sm:h-14 lg:h-20" preserveAspectRatio="none">
                        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z"
                            className="fill-white dark:fill-secondary-900" />
                    </svg>
                </div>
            </section>

            {/* ==================== FEATURES BAR ==================== */}
            <section className="bg-white dark:bg-secondary-900 py-4 sm:py-6 md:py-8 border-b border-secondary-100 dark:border-secondary-800">
                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {[
                            { icon: HiTruck, title: 'Free Shipping', desc: 'Orders $50+', color: 'primary' },
                            { icon: HiShieldCheck, title: 'Secure', desc: '100% protected', color: 'green' },
                            { icon: HiCreditCard, title: 'Easy Returns', desc: '30 days', color: 'orange' },
                            { icon: HiStar, title: '24/7 Support', desc: 'Always here', color: 'purple' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                    <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${feature.color}-600`} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-secondary-900 dark:text-white text-xs sm:text-sm truncate">{feature.title}</div>
                                    <div className="text-[10px] sm:text-xs text-secondary-500 truncate">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== CATEGORIES SECTION - INSTANT LOAD ==================== */}
            <section className="py-6 sm:py-10 md:py-14 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 dark:opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 0.5px, transparent 0)`,
                        backgroundSize: '24px 24px',
                        color: '#94a3b8'
                    }} />
                </div>

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-3 sm:px-4 relative">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-4 sm:mb-6"
                    >
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                            <HiSparkles className="w-3 h-3" />
                            CATEGORIES
                        </span>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white">
                            Shop by Category
                        </h2>
                    </motion.div>

                    {/* Categories Grid or Skeleton */}
                    {categoriesLoading ? (
                        <CategorySkeleton count={8} />
                    ) : categories.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 md:gap-3">
                            {categories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                >
                                    <Link
                                        to={`/products?category=${category.slug}`}
                                        className="block bg-white dark:bg-secondary-800 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-emerald-400 dark:hover:border-emerald-500 group"
                                    >
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto rounded-lg bg-gradient-to-br ${getCategoryColor(category)} flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform`}>
                                            <span className="text-sm sm:text-base md:text-lg">{getCategoryIcon(category)}</span>
                                        </div>
                                        <h3 className="font-medium text-secondary-900 dark:text-white text-[8px] sm:text-[10px] md:text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-tight">
                                            {category.name}
                                        </h3>
                                        {category.product_count !== undefined && (
                                            <p className="hidden sm:block text-[8px] sm:text-[9px] text-secondary-400 mt-0.5">
                                                {category.product_count}
                                            </p>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary-500 py-8">No categories available</p>
                    )}

                    {/* View All Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 sm:mt-6 text-center"
                    >
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 text-xs sm:text-sm"
                        >
                            View All Products
                            <HiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ==================== FEATURED PRODUCTS ==================== */}
            <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50 dark:from-secondary-900 dark:via-emerald-900/10 dark:to-secondary-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-teal-200/40 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <HiSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                                    Featured Products
                                    {!productsLoading && featuredProducts.length > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full">
                                            {featuredProducts.length}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs sm:text-sm text-secondary-500">Handpicked just for you</p>
                            </div>
                        </div>
                        <Link
                            to="/products?featured=true"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={8} />
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                            {featuredProducts.slice(0, 8).map((product, idx) => (
                                <ProductCard key={product.id} product={product} priority={idx < 4} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== HOT DEALS / ON SALE ==================== */}
            <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50 dark:from-secondary-900 dark:via-amber-900/10 dark:to-secondary-900 relative overflow-hidden">
                {/* Decorative Fire Pattern */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/50 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 relative">
                                <HiTag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                                    Hot Deals
                                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-red-500 text-white rounded animate-pulse">
                                        SALE
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">Save up to 50% off</p>
                            </div>
                        </div>
                        <Link
                            to="/products?on_sale=true"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={4} />
                    ) : onSale.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                            {onSale.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== NEW ARRIVALS ==================== */}
            <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-sky-50/50 to-indigo-50 dark:from-secondary-900 dark:via-blue-900/10 dark:to-secondary-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/50 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-200/50 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <HiLightningBolt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                                    New Arrivals
                                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                                        NEW
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-secondary-500">Fresh additions to our collection</p>
                            </div>
                        </div>
                        <Link
                            to="/products?ordering=-created_at"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={8} />
                    ) : newArrivals.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                            {newArrivals.slice(0, 8).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== BESTSELLERS ==================== */}
            <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 via-violet-50/50 to-fuchsia-50 dark:from-secondary-900 dark:via-purple-900/10 dark:to-secondary-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-200/50 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-fuchsia-200/50 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <HiStar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                                    Bestsellers
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
                                        <HiStar className="w-3 h-3" /> TOP
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-secondary-500">Customer favorites</p>
                            </div>
                        </div>
                        <Link
                            to="/products?is_bestseller=true"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={8} />
                    ) : bestsellers.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                            {bestsellers.slice(0, 8).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== NEWSLETTER / CTA SECTION ==================== */}
            <section className="py-10 sm:py-14 md:py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                </div>

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-4xl mx-auto px-4 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                            Ready to Start Shopping?
                        </h2>
                        <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto">
                            Join thousands of happy customers and discover amazing deals every day.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 font-bold rounded-full hover:bg-yellow-400 hover:text-primary-900 transition-all shadow-xl text-sm sm:text-base"
                            >
                                <HiShoppingBag className="w-5 h-5" />
                                Browse Products
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all text-sm sm:text-base"
                            >
                                Create Account
                                <HiArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;