import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiX, HiClock, HiTrendingUp, HiArrowRight } from 'react-icons/hi';
import api from '../../api/api';
import { getImageUrl, formatPrice } from '../../utils/helpers';

const SmartSearch = ({ onClose, isOpen }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced search
    const searchProducts = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get(`/products/?search=${encodeURIComponent(searchQuery)}`);
            const products = response.data.results || response.data || [];
            setResults(products.slice(0, 6)); // Limit to 6 results
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchProducts]);

    // Save to recent searches
    const saveRecentSearch = (searchTerm) => {
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Handle search submission
    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            saveRecentSearch(searchTerm.trim());
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            onClose();
        }
    };

    // Handle product click
    const handleProductClick = (product) => {
        saveRecentSearch(product.name);
        navigate(`/products/${product.slug}`);
        onClose();
    };

    // Handle recent search click
    const handleRecentClick = (term) => {
        setQuery(term);
        handleSearch(term);
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        const totalItems = results.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleProductClick(results[selectedIndex]);
                } else {
                    handleSearch(query);
                }
                break;
            case 'Escape':
                onClose();
                break;
            default:
                break;
        }
    };

    // Popular/trending searches (mock data)
    const trendingSearches = ['Shoes', 'Electronics', 'Fashion', 'Home Decor'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="relative max-w-2xl mx-auto mt-20 px-4">
                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                    {/* Search Input */}
                    <div className="relative flex items-center border-b border-secondary-100 dark:border-secondary-700">
                        <HiSearch className="absolute left-4 w-6 h-6 text-secondary-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(-1);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for products..."
                            className="w-full pl-12 pr-12 py-5 text-lg bg-transparent text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-14 p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full"
                            >
                                <HiX className="w-5 h-5 text-secondary-400" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="absolute right-4 p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full"
                        >
                            <span className="text-xs text-secondary-400 bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded">ESC</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="p-6 text-center">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-secondary-500 mt-2">Searching...</p>
                            </div>
                        )}

                        {/* Search Results */}
                        {!isLoading && query && results.length > 0 && (
                            <div className="p-2">
                                <p className="px-4 py-2 text-xs font-medium text-secondary-400 uppercase">
                                    Products
                                </p>
                                {results.map((product, index) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                                            selectedIndex === index
                                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                                : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                                        }`}
                                    >
                                        {/* Product Image */}
                                        <div className="w-14 h-14 rounded-lg bg-secondary-100 dark:bg-secondary-700 overflow-hidden flex-shrink-0">
                                            {product.primary_image?.image || product.image ? (
                                                <img
                                                    src={getImageUrl(product.primary_image?.image || product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-secondary-400">
                                                    <HiSearch className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 text-left">
                                            <h4 className="font-medium text-secondary-900 dark:text-white line-clamp-1">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-primary-500 font-semibold">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.category?.name && (
                                                    <span className="text-xs text-secondary-400">
                                                        in {product.category.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <HiArrowRight className="w-5 h-5 text-secondary-300" />
                                    </button>
                                ))}

                                {/* View All Results */}
                                <button
                                    onClick={() => handleSearch(query)}
                                    className="w-full mt-2 p-3 text-center text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl font-medium transition-colors"
                                >
                                    View all results for "{query}" →
                                </button>
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && query && results.length === 0 && (
                            <div className="p-8 text-center">
                                <HiSearch className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                                <p className="text-secondary-500 dark:text-secondary-400">
                                    No products found for "{query}"
                                </p>
                                <button
                                    onClick={() => handleSearch(query)}
                                    className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
                                >
                                    Search anyway →
                                </button>
                            </div>
                        )}

                        {/* Default State - Recent & Trending */}
                        {!query && (
                            <div className="p-4 space-y-6">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-medium text-secondary-400 uppercase flex items-center gap-2">
                                                <HiClock className="w-4 h-4" />
                                                Recent Searches
                                            </p>
                                            <button
                                                onClick={clearRecentSearches}
                                                className="text-xs text-secondary-400 hover:text-red-500"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map((term, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleRecentClick(term)}
                                                    className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors text-sm"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trending Searches */}
                                <div>
                                    <p className="text-xs font-medium text-secondary-400 uppercase flex items-center gap-2 mb-3">
                                        <HiTrendingUp className="w-4 h-4" />
                                        Trending
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingSearches.map((term, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleRecentClick(term)}
                                                className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Keyboard Shortcuts */}
                                <div className="pt-4 border-t border-secondary-100 dark:border-secondary-700">
                                    <div className="flex items-center justify-center gap-6 text-xs text-secondary-400">
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded">↑↓</kbd>
                                            to navigate
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded">Enter</kbd>
                                            to select
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded">Esc</kbd>
                                            to close
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartSearch;