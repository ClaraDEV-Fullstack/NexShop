// src/pages/Products.jsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiFilter,
    HiX,
    HiSearch,
    HiChevronLeft,
    HiChevronRight,
    HiChevronDown,
    HiChevronUp,
    HiAdjustments,
    HiShoppingBag
} from 'react-icons/hi';
import { productsAPI, categoriesAPI } from '../api/api';
import ProductCard from '../components/products/ProductCard';

import { formatPrice } from '../utils/helpers';

// ========== SIMPLE CACHE FOR API RESPONSES ==========
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCachedData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// ========== SKELETON LOADER COMPONENT ==========
const ProductSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700"
                >
                    {/* Image Skeleton */}
                    <div className="relative h-32 sm:h-40 bg-secondary-100 dark:bg-secondary-700 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                    {/* Content Skeleton */}
                    <div className="p-3 space-y-2">
                        <div className="h-3 w-16 bg-secondary-200 dark:bg-secondary-700 rounded-full animate-pulse" />
                        <div className="h-4 w-full bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
                        <div className="flex gap-0.5 pt-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full animate-pulse" />
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-secondary-100 dark:border-secondary-700">
                            <div className="h-5 w-16 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
                            <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ========== PRODUCT GRID COMPONENT ==========
const ProductGrid = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const abortControllerRef = useRef(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
        pageSize: 12,
    });

    // Expanded categories state
    const [expandedCategories, setExpandedCategories] = useState({});

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('min_price') || '',
        maxPrice: searchParams.get('max_price') || '',
        search: searchParams.get('search') || '',
        ordering: searchParams.get('ordering') || '-created_at',
        page: parseInt(searchParams.get('page')) || 1,
    });

    // Featured categories - memoized
    const featuredCategories = useMemo(() => [
        { name: 'Electronics', slug: 'electronics', icon: '💻', color: 'from-primary-500 to-primary-600' },
        { name: 'Fashion', slug: 'fashion', icon: '👗', color: 'from-pink-500 to-pink-600' },
        { name: 'Home', slug: 'home-living', icon: '🏠', color: 'from-amber-500 to-amber-600' },
        { name: 'Beauty', slug: 'beauty-skincare', icon: '✨', color: 'from-primary-500 to-primary-600' },
        { name: 'Books', slug: 'books-education', icon: '📚', color: 'from-green-500 to-green-600' },
        { name: 'Sports', slug: 'sports-fitness', icon: '🏃', color: 'from-red-500 to-red-600' },
        { name: 'Kids', slug: 'kids-toys', icon: '🧸', color: 'from-yellow-500 to-yellow-600' },
        { name: 'Digital', slug: 'digital-products', icon: '📱', color: 'from-cyan-500 to-cyan-600' },
    ], []);

    // Organize categories into hierarchy - memoized
    const organizedCategories = useMemo(() => {
        const mainCategories = categories.filter(cat => !cat.parent);
        const subCategories = categories.filter(cat => cat.parent);
        return mainCategories.map(main => ({
            ...main,
            children: subCategories.filter(sub => sub.parent === main.id)
        }));
    }, [categories]);

    // Fetch categories - with caching
    useEffect(() => {
        const fetchCategories = async () => {
            const cacheKey = 'categories_all';
            const cached = getCachedData(cacheKey);

            if (cached) {
                setCategories(cached);
                return;
            }

            try {
                const response = await categoriesAPI.getAll();
                const data = response.data;
                const categoriesList = Array.isArray(data) ? data : (data.results || []);
                setCategories(categoriesList);
                setCachedData(cacheKey, categoriesList);

                if (filters.category) {
                    const selectedCat = categoriesList.find(c => c.slug === filters.category);
                    if (selectedCat?.parent) {
                        const parentCat = categoriesList.find(c => c.id === selectedCat.parent);
                        if (parentCat) setExpandedCategories(prev => ({ ...prev, [parentCat.id]: true }));
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products - with caching and abort controller
    const fetchProducts = useCallback(async () => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Create cache key from filters
        const cacheKey = `products_${JSON.stringify(filters)}`;
        const cached = getCachedData(cacheKey);

        if (cached) {
            setProducts(cached.products);
            setPagination(prev => ({ ...prev, ...cached.pagination }));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const params = {
                page: filters.page,
                page_size: pagination.pageSize
            };
            if (filters.category) params.category = filters.category;
            if (filters.minPrice) params.min_price = filters.minPrice;
            if (filters.maxPrice) params.max_price = filters.maxPrice;
            if (filters.search) params.search = filters.search;
            if (filters.ordering) params.ordering = filters.ordering;

            const response = await productsAPI.getAll(params);
            const data = response.data;

            let productsList = [];
            let paginationData = {};

            if (Array.isArray(data)) {
                productsList = data;
                paginationData = { count: data.length, totalPages: 1, next: null, previous: null };
            } else if (data.results) {
                productsList = data.results;
                paginationData = {
                    count: data.count,
                    next: data.next,
                    previous: data.previous,
                    totalPages: Math.ceil(data.count / pagination.pageSize),
                };
            }

            setProducts(productsList);
            setPagination(prev => ({ ...prev, ...paginationData }));

            // Cache the results
            setCachedData(cacheKey, { products: productsList, pagination: paginationData });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching products:', error);
                setProducts([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [filters, pagination.pageSize]);

    useEffect(() => {
        fetchProducts();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchProducts]);

    // Debounced search
    const searchTimeoutRef = useRef(null);

    const handleSearchChange = useCallback((value) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleFilterChange('search', value);
        }, 300);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            if (key !== 'page') newFilters.page = 1;

            const newParams = new URLSearchParams();
            if (newFilters.category) newParams.set('category', newFilters.category);
            if (newFilters.minPrice) newParams.set('min_price', newFilters.minPrice);
            if (newFilters.maxPrice) newParams.set('max_price', newFilters.maxPrice);
            if (newFilters.search) newParams.set('search', newFilters.search);
            if (newFilters.ordering && newFilters.ordering !== '-created_at') newParams.set('ordering', newFilters.ordering);
            if (newFilters.page > 1) newParams.set('page', newFilters.page.toString());
            setSearchParams(newParams);

            return newFilters;
        });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            handleFilterChange('page', newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagination.totalPages, handleFilterChange]);

    const clearFilters = useCallback(() => {
        setFilters({ category: '', minPrice: '', maxPrice: '', search: '', ordering: '-created_at', page: 1 });
        setSearchParams({});
    }, [setSearchParams]);

    const toggleCategory = useCallback((categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    }, []);

    const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.search;

    const getPageNumbers = useMemo(() => {
        const pages = [];
        const { totalPages } = pagination;
        const currentPage = filters.page;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    }, [pagination.totalPages, filters.page]);

    const getCurrentCategoryName = useCallback(() => {
        if (!filters.category) return 'All Products';
        const cat = categories.find(c => c.slug === filters.category);
        return cat ? cat.name : 'All Products';
    }, [filters.category, categories]);

    const activeFilterCount = useMemo(() =>
            [filters.category, filters.minPrice, filters.maxPrice, filters.search].filter(Boolean).length,
        [filters]);

    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
                    <div className="text-center">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5">
                            {getCurrentCategoryName()}
                        </h1>
                        <p className="text-white/80 text-xs md:text-sm">
                            Find the perfect products for you
                        </p>
                    </div>
                </div>
                <div className="h-3 md:h-4">
                    <svg viewBox="0 0 1440 24" fill="none" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M0 24h1440V0c-211.5 16-435.7 24-672 24S211.5 16 0 0v24z" className="fill-secondary-50 dark:fill-secondary-900" />
                    </svg>
                </div>
            </div>

            <div className="w-[95%] lg:w-[90%] max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
                {/* Search and Filter Bar */}
                <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-100 dark:border-secondary-700 p-2 md:p-3 mb-3">
                    <div className="flex flex-row gap-1.5 md:gap-2">
                        {/* Search with debounce */}
                        <div className="relative flex-1">
                            <HiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                            <input
                                type="text"
                                defaultValue={filters.search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-8 pr-2 py-2 md:py-2.5 rounded-lg border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700/50 text-secondary-900 dark:text-white text-xs md:text-sm placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Sort - Desktop */}
                        <div className="relative hidden sm:block">
                            <select
                                value={filters.ordering}
                                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                                className="h-full pl-2 pr-6 py-2 md:py-2.5 rounded-lg border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700/50 text-secondary-900 dark:text-white text-xs md:text-sm focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                            >
                                <option value="-created_at">Newest</option>
                                <option value="price">Price ↑</option>
                                <option value="-price">Price ↓</option>
                                <option value="name">A-Z</option>
                            </select>
                            <HiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-400 pointer-events-none" />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-1 px-2.5 md:px-3 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all ${
                                showFilters || hasActiveFilters
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200'
                            }`}
                        >
                            <HiAdjustments className="w-4 h-4" />
                            <span className="hidden md:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 text-[10px] font-bold bg-white text-primary-600 rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-secondary-100 dark:border-secondary-700">
                            {filters.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] md:text-xs rounded-full">
                                    {getCurrentCategoryName()}
                                    <button onClick={() => handleFilterChange('category', '')}><HiX className="w-3 h-3" /></button>
                                </span>
                            )}
                            {(filters.minPrice || filters.maxPrice) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] md:text-xs rounded-full">
                                    {filters.minPrice || '0'}-{filters.maxPrice || '∞'} FCFA
                                    <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }}><HiX className="w-3 h-3" /></button>
                                </span>
                            )}
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] md:text-xs rounded-full">
                                    "{filters.search}"
                                    <button onClick={() => handleFilterChange('search', '')}><HiX className="w-3 h-3" /></button>
                                </span>
                            )}
                            <button onClick={clearFilters} className="text-[10px] md:text-xs text-red-600 hover:text-red-700 font-medium ml-1">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Featured Categories */}
                <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm md:text-base font-bold text-secondary-900 dark:text-white">
                            Categories
                        </h2>
                        {filters.category && (
                            <button onClick={() => handleFilterChange('category', '')} className="text-[10px] md:text-xs text-primary-600 font-medium">
                                View All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 md:gap-2">
                        {featuredCategories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleFilterChange('category', cat.slug)}
                                className={`relative p-1.5 md:p-2 rounded-lg text-center transition-all active:scale-95 ${
                                    filters.category === cat.slug
                                        ? 'bg-gradient-to-br ' + cat.color + ' text-white shadow-md'
                                        : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="text-base md:text-xl mb-0.5">{cat.icon}</div>
                                <div className={`text-[9px] md:text-[10px] font-medium truncate ${
                                    filters.category === cat.slug ? 'text-white' : 'text-secondary-700 dark:text-secondary-300'
                                }`}>
                                    {cat.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-2 md:mb-3">
                    <p className="text-[10px] md:text-xs text-secondary-500 dark:text-secondary-400">
                        {isLoading ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></span>
                                Loading...
                            </span>
                        ) : (
                            <>
                                <span className="font-medium text-secondary-900 dark:text-white">{pagination.count}</span> products
                                {pagination.totalPages > 1 && <span className="ml-1">• Page {filters.page}/{pagination.totalPages}</span>}
                            </>
                        )}
                    </p>

                    {/* Mobile Sort */}
                    <div className="relative sm:hidden">
                        <select
                            value={filters.ordering}
                            onChange={(e) => handleFilterChange('ordering', e.target.value)}
                            className="pl-1.5 pr-5 py-1 rounded border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-[10px] focus:ring-1 focus:ring-primary-500 appearance-none"
                        >
                            <option value="-created_at">Newest</option>
                            <option value="price">Price ↑</option>
                            <option value="-price">Price ↓</option>
                            <option value="name">A-Z</option>
                        </select>
                        <HiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-secondary-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex gap-3 md:gap-4 lg:gap-6">
                    {/* Sidebar */}
                    <AnimatePresence>
                        {showFilters && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowFilters(false)}
                                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                />

                                <motion.aside
                                    initial={{ x: -280, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -280, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-secondary-800 overflow-y-auto shadow-2xl md:static md:z-0 md:w-52 lg:w-56 md:flex-shrink-0 md:shadow-none md:rounded-lg md:border md:border-secondary-100 md:dark:border-secondary-700"
                                >
                                    <div className="flex justify-between items-center p-3 border-b border-secondary-100 dark:border-secondary-700 md:hidden">
                                        <h2 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                                            <HiFilter className="w-4 h-4 text-primary-600" />
                                            Filters
                                        </h2>
                                        <button onClick={() => setShowFilters(false)} className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
                                            <HiX className="w-4 h-4 text-secondary-500" />
                                        </button>
                                    </div>

                                    <div className="p-3 space-y-3">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="w-full py-1.5 text-xs text-red-600 font-medium flex items-center justify-center gap-1 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <HiX className="w-3.5 h-3.5" /> Clear all
                                            </button>
                                        )}

                                        <div>
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2 text-xs">Categories</h4>
                                            <div className="space-y-0.5 max-h-[200px] md:max-h-[250px] overflow-y-auto">
                                                <label className={`flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg text-xs ${
                                                    filters.category === '' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 font-medium' : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50 text-secondary-600'
                                                }`}>
                                                    <input type="radio" name="category" checked={filters.category === ''} onChange={() => handleFilterChange('category', '')} className="w-3.5 h-3.5 text-primary-600" />
                                                    All Categories
                                                </label>

                                                {organizedCategories.map((mainCat) => (
                                                    <div key={mainCat.id}>
                                                        <div className={`flex items-center rounded-lg ${filters.category === mainCat.slug ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50'}`}>
                                                            <label className="flex-1 flex items-center gap-2 cursor-pointer py-1.5 px-2 text-xs">
                                                                <input type="radio" name="category" checked={filters.category === mainCat.slug} onChange={() => handleFilterChange('category', mainCat.slug)} className="w-3.5 h-3.5 text-primary-600" />
                                                                <span className={filters.category === mainCat.slug ? 'font-medium text-primary-700' : 'text-secondary-700 dark:text-secondary-300'}>
                                                                    {mainCat.name}
                                                                </span>
                                                            </label>
                                                            {mainCat.children?.length > 0 && (
                                                                <button onClick={() => toggleCategory(mainCat.id)} className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-600 rounded mr-1">
                                                                    {expandedCategories[mainCat.id] ? <HiChevronUp className="w-3.5 h-3.5 text-secondary-400" /> : <HiChevronDown className="w-3.5 h-3.5 text-secondary-400" />}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <AnimatePresence>
                                                            {mainCat.children?.length > 0 && expandedCategories[mainCat.id] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="ml-3 pl-2 border-l-2 border-secondary-200 dark:border-secondary-600 space-y-0.5 overflow-hidden"
                                                                >
                                                                    {mainCat.children.map((subCat) => (
                                                                        <label key={subCat.id} className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded text-[11px] ${
                                                                            filters.category === subCat.slug ? 'text-primary-600 font-medium' : 'text-secondary-500 hover:text-secondary-700'
                                                                        }`}>
                                                                            <input type="radio" name="category" checked={filters.category === subCat.slug} onChange={() => handleFilterChange('category', subCat.slug)} className="w-3 h-3 text-primary-600" />
                                                                            {subCat.name}
                                                                        </label>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-secondary-100 dark:border-secondary-700"></div>

                                        <div>
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2 text-xs">Price Range</h4>
                                            <div className="flex gap-1.5 items-center mb-2">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 text-[10px]">F</span>
                                                    <input
                                                        type="number"
                                                        value={filters.minPrice}
                                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                        placeholder="Min"
                                                        min="0"
                                                        className="w-full pl-5 pr-1.5 py-1.5 rounded border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700/50 text-secondary-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                                                    />
                                                </div>
                                                <span className="text-secondary-300 text-xs">—</span>
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 text-[10px]">F</span>
                                                    <input
                                                        type="number"
                                                        value={filters.maxPrice}
                                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                        placeholder="Max"
                                                        min="0"
                                                        className="w-full pl-5 pr-1.5 py-1.5 rounded border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700/50 text-secondary-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1">
                                                {[
                                                    { label: '<10k', min: '', max: '10000' },
                                                    { label: '10k-50k', min: '10000', max: '50000' },
                                                    { label: '50k-200k', min: '50000', max: '200000' },
                                                    { label: '200k+', min: '200000', max: '' },
                                                ].map((range) => (
                                                    <button
                                                        key={range.label}
                                                        onClick={() => { handleFilterChange('minPrice', range.min); handleFilterChange('maxPrice', range.max); }}
                                                        className={`px-1.5 py-1 text-[10px] font-medium rounded border transition-all ${
                                                            filters.minPrice === range.min && filters.maxPrice === range.max
                                                                ? 'bg-primary-600 border-primary-600 text-white'
                                                                : 'border-secondary-200 dark:border-secondary-600 text-secondary-600 hover:border-primary-400'
                                                        }`}
                                                    >
                                                        {range.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 md:hidden"
                                        >
                                            <HiShoppingBag className="w-4 h-4" />
                                            Show {pagination.count} Products
                                        </button>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Products Section */}
                    <main className="flex-1 min-w-0">
                        {isLoading ? (
                            <ProductSkeleton count={12} />
                        ) : products.length > 0 ? (
                            <>
                                <ProductGrid products={products} />

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-4 md:mt-6">
                                        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-100 dark:border-secondary-700 p-3">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-[10px] text-secondary-500 dark:text-secondary-400">
                                                    Showing {((filters.page - 1) * pagination.pageSize) + 1}-{Math.min(filters.page * pagination.pageSize, pagination.count)} of {pagination.count}
                                                </p>

                                                <div className="flex items-center gap-0.5">
                                                    <button
                                                        onClick={() => handlePageChange(filters.page - 1)}
                                                        disabled={filters.page === 1}
                                                        className={`p-1.5 rounded border transition-all ${
                                                            filters.page === 1
                                                                ? 'border-secondary-200 text-secondary-300 cursor-not-allowed'
                                                                : 'border-secondary-200 text-secondary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                                                        }`}
                                                    >
                                                        <HiChevronLeft className="w-4 h-4" />
                                                    </button>

                                                    <div className="flex items-center gap-0.5">
                                                        {getPageNumbers.map((page, index) => (
                                                            page === '...' ? (
                                                                <span key={`ellipsis-${index}`} className="px-1.5 text-secondary-400 text-xs">···</span>
                                                            ) : (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => handlePageChange(page)}
                                                                    className={`min-w-[28px] h-7 rounded text-xs font-medium transition-all ${
                                                                        filters.page === page
                                                                            ? 'bg-primary-600 text-white'
                                                                            : 'text-secondary-600 hover:bg-secondary-100'
                                                                    }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            )
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => handlePageChange(filters.page + 1)}
                                                        disabled={filters.page === pagination.totalPages}
                                                        className={`p-1.5 rounded border transition-all ${
                                                            filters.page === pagination.totalPages
                                                                ? 'border-secondary-200 text-secondary-300 cursor-not-allowed'
                                                                : 'border-secondary-200 text-secondary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                                                        }`}
                                                    >
                                                        <HiChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-100 dark:border-secondary-700 p-6 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                                    <HiSearch className="w-6 h-6 text-secondary-400" />
                                </div>
                                <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-1">No products found</h3>
                                <p className="text-xs text-secondary-500 mb-3">Try adjusting your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg"
                                >
                                    <HiX className="w-3.5 h-3.5" /> Clear filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Products;