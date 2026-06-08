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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
            <section className="relative overflow-hidden text-white" style={{ backgroundColor: '#0b1326' }}>

                {/* ── Background: green radial glow + accent glows ── */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(circle at 50% 55%, rgba(21,128,61,0.38) 0%, rgba(11,19,38,0) 68%)'
                    }} />
                    <div className="absolute -top-24 right-1/3 w-72 h-72 rounded-full blur-[90px]"
                        style={{ backgroundColor: 'rgba(238,194,0,0.09)' }} />
                    <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full blur-[80px]"
                        style={{ backgroundColor: 'rgba(121,219,141,0.1)' }} />
                </div>

                {/* ── Wave dividers ── */}
                <div className="absolute -bottom-1 left-0 right-0 z-20 pointer-events-none">
                    <svg viewBox="0 0 1440 160" fill="none" className="absolute bottom-0 w-full h-10 sm:h-14 md:h-20 lg:h-28" preserveAspectRatio="none">
                        <path d="M0,100 C240,140 360,50 600,90 C840,130 960,40 1200,80 C1320,100 1380,130 1440,110 L1440,160 L0,160 Z"
                            style={{ fill: 'rgba(11,19,38,0.35)' }} />
                    </svg>
                    <svg viewBox="0 0 1440 160" fill="none" className="relative w-full h-8 sm:h-12 md:h-16 lg:h-20" preserveAspectRatio="none">
                        <path d="M0,110 C120,130 240,70 420,90 C600,110 720,150 900,120 C1080,90 1200,140 1320,110 C1380,95 1420,120 1440,110 L1440,160 L0,160 Z"
                            className="fill-white dark:fill-gray-900" />
                    </svg>
                </div>

                {/* ── Main grid ── */}
                <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8 sm:py-12 md:py-16 lg:py-20 pb-20 sm:pb-24 md:pb-28 lg:pb-32">

                        {/* ─── LEFT: text ─── */}
                        <div className="flex flex-col gap-4 order-2 md:order-1">

                            {/* Shipping badge */}
                            <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit"
                                    style={{
                                        background: 'rgba(21,128,61,0.2)',
                                        border: '1px solid rgba(121,219,141,0.3)',
                                        color: '#79db8d',
                                        fontFamily: "'Hanken Grotesk', sans-serif"
                                    }}>
                                    🚚 Livraison gratuite dès 50 000 FCFA
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.1 }}
                                className="space-y-1">
                                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15 }}
                                    className="text-4xl sm:text-5xl lg:text-[3.1rem] xl:text-[3.6rem]">
                                    <span className="block" style={{ color: '#dae2fd' }}>Discover Your</span>
                                    <span className="block" style={{ color: '#ffe083' }}>Perfect Style</span>
                                </h1>
                                <p className="text-lg sm:text-xl font-bold pt-1"
                                    style={{ color: '#becabc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    Shop Smarter, Live Better
                                </p>
                            </motion.div>

                            {/* Description */}
                            <motion.p initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.18 }}
                                className="text-sm sm:text-base max-w-md leading-relaxed"
                                style={{ color: '#becabc', fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                Électronique, Mode, Beauté, Maison &amp; plus —
                                prix imbattables, livraison rapide, paiement 100% sécurisé.
                            </motion.p>

                            {/* Category chips */}
                            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.24 }}
                                className="flex overflow-x-auto gap-2 py-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {[
                                    { icon: HiLightningBolt, label: 'Électronique' },
                                    { icon: HiTag,           label: 'Mode' },
                                    { icon: HiSparkles,      label: 'Beauté' },
                                ].map((chip, i) => (
                                    <Link key={i} to="/products"
                                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-opacity hover:opacity-80"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#dae2fd',
                                            fontFamily: "'Hanken Grotesk', sans-serif",
                                            textDecoration: 'none'
                                        }}>
                                        <chip.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#79db8d' }} />
                                        {chip.label}
                                    </Link>
                                ))}
                            </motion.div>

                            {/* CTA buttons */}
                            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}
                                className="flex flex-row gap-3 mt-1">
                                <Link to="/products"
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:brightness-110"
                                    style={{
                                        background: '#79db8d',
                                        color: '#003916',
                                        boxShadow: '0 4px 20px rgba(121,219,141,0.25)',
                                        fontFamily: "'Hanken Grotesk', sans-serif"
                                    }}>
                                    <HiShoppingBag className="w-5 h-5" />
                                    Shop Now
                                </Link>
                                <Link to="/products?on_sale=true"
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:bg-white/10"
                                    style={{
                                        border: '1px solid rgba(121,219,141,0.3)',
                                        color: '#dae2fd',
                                        fontFamily: "'Hanken Grotesk', sans-serif"
                                    }}>
                                    <HiTag className="w-5 h-5" />
                                    Promotions
                                </Link>
                            </motion.div>

                            {/* Stats bar */}
                            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.38 }}
                                className="grid grid-cols-3 gap-2 py-5 mt-2"
                                style={{ borderTop: '1px solid rgba(63,73,63,0.35)', borderBottom: '1px solid rgba(63,73,63,0.35)' }}>
                                {[
                                    { value: '50K+', label: 'CLIENTS' },
                                    { value: '40+',  label: 'CATÉGORIES', mid: true },
                                    { value: '4.9★', label: 'NOTE' },
                                ].map((s, i) => (
                                    <div key={i}
                                        className={s.mid ? 'text-center' : 'text-left md:text-center'}
                                        style={s.mid ? {
                                            borderLeft:  '1px solid rgba(63,73,63,0.35)',
                                            borderRight: '1px solid rgba(63,73,63,0.35)',
                                            paddingLeft: '8px', paddingRight: '8px'
                                        } : {}}>
                                        <p className="font-black text-2xl sm:text-[2rem] leading-none"
                                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#79db8d' }}>
                                            {s.value}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase mt-1.5"
                                            style={{ color: '#becabc', letterSpacing: '0.06em', fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* ─── RIGHT: image ─── */}
                        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
                            transition={{ duration:0.7, delay:0.15, ease:[0.25,0.46,0.45,0.94] }}
                            className="relative order-1 md:order-2">

                            {/* Image frame */}
                            <div className="relative group rounded-2xl overflow-hidden shadow-2xl"
                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                <img
                                    src="/images/hero-shopping.jpg"
                                    alt="Shopping Experience"
                                    fetchpriority="high"
                                    loading="eager"
                                    className="w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ aspectRatio: '3/4', maxHeight: '520px' }}
                                />
                                {/* Bottom gradient */}
                                <div className="absolute inset-0 pointer-events-none" style={{
                                    background: 'linear-gradient(to top, rgba(11,19,38,0.55) 0%, rgba(11,19,38,0.08) 45%, transparent 70%)'
                                }} />

                                {/* ── Rating badge — top right ── */}
                                <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
                                    transition={{ delay:0.85, type:'spring', stiffness:120 }}
                                    className="absolute top-5 right-5 bg-white rounded-xl p-3 shadow-2xl flex flex-col items-center min-w-[80px]">
                                    <div className="flex gap-0.5 mb-1">
                                        {[...Array(5)].map((_,i) => (
                                            <HiStar key={i} className="w-3 h-3 fill-current" style={{ color: '#eec200' }} />
                                        ))}
                                    </div>
                                    <p className="text-sm font-black text-slate-900 leading-none">4.9</p>
                                    <p className="text-[9px] text-slate-500 font-bold leading-tight text-center mt-0.5">
                                        2.5k+ avis<br/>vérifiés
                                    </p>
                                </motion.div>

                                {/* ── Bottom bar: glass card + arrow button ── */}
                                <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                                    transition={{ delay:1.0, type:'spring', stiffness:100 }}
                                    className="absolute bottom-5 left-5 right-5 flex justify-between items-end gap-3">
                                    <div className="flex-1 p-3.5 rounded-xl"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255,255,255,0.12)'
                                        }}>
                                        <p className="text-sm font-bold text-white leading-tight"
                                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            Qualité Premium
                                        </p>
                                        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#becabc' }}>
                                            Sélection rigoureuse des meilleures marques.
                                        </p>
                                    </div>
                                    <Link to="/products"
                                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 hover:scale-110"
                                        style={{ background: '#79db8d', boxShadow: '0 4px 16px rgba(121,219,141,0.4)' }}>
                                        <HiArrowRight className="w-5 h-5" style={{ color: '#003916' }} />
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Decorative blurs behind the image */}
                            <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl"
                                style={{ background: 'rgba(121,219,141,0.18)' }} />
                            <div className="absolute -z-10 -top-6 -left-6 w-24 h-24 rounded-full blur-2xl"
                                style={{ background: 'rgba(238,194,0,0.1)' }} />
                        </motion.div>

                    </div>
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
                            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold rounded-lg sm:rounded-xl hover:from-primary-800 hover:to-primary-600 transition-all shadow-md shadow-primary-500/20 text-xs sm:text-sm"
                        >
                            View All Products
                            <HiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ==================== FEATURED PRODUCTS ==================== */}
            <section className="py-10 sm:py-14 md:py-18 bg-gradient-to-br from-primary-50 via-primary-50/40 to-secondary-50 dark:from-secondary-900 dark:via-primary-900/8 dark:to-secondary-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-bl from-primary-200/40 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-primary-200/30 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <HiSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                                    Featured Products
                                    {!productsLoading && featuredProducts.length > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 rounded-full">
                                            {featuredProducts.length}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs sm:text-sm text-secondary-500">Handpicked just for you</p>
                            </div>
                        </div>
                        <Link
                            to="/products?featured=true"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={8} />
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            {onSale.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== NEW ARRIVALS ==================== */}
            <section className="py-10 sm:py-14 md:py-18 bg-white dark:from-secondary-900 dark:via-primary-900/5 dark:to-secondary-900 relative overflow-hidden dark:bg-secondary-900">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-200/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold-200/20 to-transparent rounded-full blur-3xl" />

                <div className="w-[92%] sm:w-[95%] lg:w-[90%] max-w-7xl mx-auto px-4 relative">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <HiLightningBolt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                                    New Arrivals
                                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full">
                                        NEW
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-secondary-500">Fresh additions to our collection</p>
                            </div>
                        </div>
                        <Link
                            to="/products?ordering=-created_at"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 transition-colors"
                        >
                            View All <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid or Skeleton */}
                    {productsLoading ? (
                        <ProductSectionSkeleton count={8} />
                    ) : newArrivals.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            {newArrivals.slice(0, 8).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ==================== BESTSELLERS ==================== */}
            <section className="py-10 sm:py-14 md:py-18 bg-gradient-to-br from-gold-50 via-gold-50/30 to-secondary-50 dark:from-secondary-900 dark:via-gold-900/8 dark:to-secondary-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-gold-200/40 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-gold-200/30 to-transparent rounded-full blur-3xl" />

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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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