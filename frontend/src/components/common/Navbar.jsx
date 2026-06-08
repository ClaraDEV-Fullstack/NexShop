import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    HiOutlineShoppingCart,
    HiOutlineUser,
    HiOutlineSearch,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineHeart,
    HiOutlineBell,
    HiOutlineViewGrid,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineShoppingBag,
    HiSun,
    HiMoon,
    HiChevronDown,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineChevronRight,
    HiOutlineInformationCircle
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { selectCartCount, toggleCart } from '../../store/cartSlice';
import { logoutUser } from '../../store/authSlice';
import { useTheme } from '../../context/ThemeContext';
import SmartSearch from '../search/SmartSearch';
import toast from 'react-hot-toast';


// Helper function to get user avatar (Cloudinary compatible)
const getUserAvatar = (user) => {
    // Prefer avatar_url (processed by backend)
    if (user?.avatar_url) {
        return user.avatar_url;
    }

    if (user?.avatar) {
        let url = user.avatar;

        // Already a valid URL
        if (url.startsWith('https://') || url.startsWith('http://')) {
            return url;
        }

        // Fix malformed Cloudinary URLs
        if (url.includes('res.cloudinary.com')) {
            // Extract cloudinary path
            const match = url.match(/(res\.cloudinary\.com\/[^\s]+)/);
            if (match) {
                return 'https://' + match[1];
            }
        }

        // Fix /media/https:/ pattern
        if (url.includes('/media/') && url.includes('cloudinary')) {
            url = url.replace('/media/', '');
            if (url.startsWith('https:/') && !url.startsWith('https://')) {
                url = 'https://' + url.substring(7);
            }
            return url;
        }

        // For relative paths, use environment variable or fallback
        if (url.startsWith('/')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://nexshop.onrender.com';
            return `${baseUrl}${url}`;
        }

        return url;
    }

    return null;
};

// Helper to get user initials
const getUserInitials = (user) => {
    if (user?.first_name && user?.last_name) {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    if (user?.first_name) return user.first_name.charAt(0);
    if (user?.username) return user.username.charAt(0);
    return 'U';
};

// Avatar component with fallback
const UserAvatar = ({ user, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = getUserAvatar(user);
    const initials = getUserInitials(user);

    const sizeClasses = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-14 h-14 text-lg',
    };

    if (avatarUrl && !imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}>
                <img
                    src={avatarUrl}
                    alt={user?.first_name || 'User'}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold ${className}`}>
            {initials}
        </div>
    );
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const userMenuRef = useRef(null);

    const cartCount = useSelector(selectCartCount);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser());
        toast.success('Logged out successfully');
        navigate('/');
        setIsUserMenuOpen(false);
    };

    const notificationCount = 3;

    return (
        <>
            {/* Top Bar */}
            <div className="hidden lg:block text-white" style={{ backgroundColor: '#0b1326', borderBottom: '1px solid rgba(121,219,141,0.12)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-8 text-xs">
                        <div className="flex items-center gap-4">
                            <a
                                href="mailto:nexshop@gmail.com"
                                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                            >
                                <HiOutlineMail className="w-3 h-3" />
                                <span>nexshop@gmail.com</span>
                            </a>
                            <a
                                href="tel:+237683669723"
                                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                            >
                                <HiOutlinePhone className="w-3 h-3" />
                                <span>+237 683 669 723</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-white/50">
                                <HiOutlineLocationMarker className="w-3 h-3" />
                                <span>Douala, Cameroon</span>
                            </div>
                            <div className="h-3 w-px bg-primary-800"></div>
                            <a
                                href="https://wa.me/237683669723"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                <FaWhatsapp className="w-3 h-3" />
                                <span>WhatsApp</span>
                            </a>
                            <div className="h-3 w-px bg-primary-800"></div>
                            <Link to="/about" className="text-white/60 hover:text-white transition-colors">About</Link>
                            <Link to="/faq" className="text-white/60 hover:text-white transition-colors">FAQ</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`sticky top-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? 'bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none'
                    : 'bg-white dark:bg-secondary-900 border-b border-gray-100 dark:border-secondary-800'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 py-1">

                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <div className="relative">
                                {/* Logo Image or Fallback */}
                                <div className="w-9 h-9 rounded-lg overflow-hidden shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all mr-2 group-hover:scale-105 flex items-center justify-center bg-white border border-gray-100">
                                    {!logoError ? (
                                        <img
                                            src="/logo.png"
                                            alt="NEXSHOP"
                                            className="w-full h-full object-contain p-0.5"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <span className="text-primary-600 font-bold text-lg">N</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-extrabold leading-tight tracking-tight">
                                    <span className="bg-gradient-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">NEX</span><span style={{ color: '#ffe083' }}>SHOP</span>
                                </span>
                                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase hidden sm:block">
                                    Shop with confidence
                                </span>
                            </div>
                        </Link>

                        {/* Search - Desktop */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 flex-1 max-w-lg mx-4 px-3 py-2 bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-lg text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-white dark:hover:bg-secondary-700 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                            <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-800 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HiOutlineSearch className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="flex-1 text-left text-gray-500 dark:text-gray-400 text-sm">Search for products...</span>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-secondary-600 rounded-md">
                                <kbd className="text-[10px] font-mono text-gray-500 dark:text-gray-400">⌘</kbd>
                                <kbd className="text-[10px] font-mono text-gray-500 dark:text-gray-400">K</kbd>
                            </div>
                        </button>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {/* Products Link */}
                            <Link
                                to="/products"
                                className="group flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-sm"
                            >
                                <HiOutlineShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Products</span>
                            </Link>

                            {/* About Link */}
                            <Link
                                to="/about"
                                className="group flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-sm"
                            >
                                <HiOutlineInformationCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>About</span>
                            </Link>

                            {/* Contact Link */}
                            <Link
                                to="/contact"
                                className="group flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-sm"
                            >
                                <HiOutlineMail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Contact</span>
                            </Link>

                            <div className="h-6 w-px bg-gray-200 dark:bg-secondary-700 mx-1"></div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-all group"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <HiSun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                                ) : (
                                    <HiMoon className="w-4 h-4 text-primary-400 group-hover:-rotate-12 transition-transform" />
                                )}
                            </button>

                            {/* Wishlist */}
                            {isAuthenticated && (
                                <Link
                                    to="/wishlist"
                                    className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-all group"
                                >
                                    <HiOutlineHeart className="w-4 h-4 group-hover:scale-110 group-hover:text-rose-500 transition-all" />
                                </Link>
                            )}

                            {/* Notifications */}
                            {isAuthenticated && (
                                <Link
                                    to="/dashboard/notifications"
                                    className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-all group"
                                >
                                    <HiOutlineBell className="w-4 h-4 group-hover:scale-110 group-hover:text-primary-500 transition-all" />
                                    {notificationCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Cart */}
                            <button
                                onClick={() => dispatch(toggleCart())}
                                className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-all group"
                            >
                                <HiOutlineShoppingCart className="w-4 h-4 group-hover:scale-110 group-hover:text-primary-500 transition-all" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-[#0b1326] to-primary-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative ml-1" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                                            isUserMenuOpen
                                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                                : 'hover:bg-gray-100 dark:hover:bg-secondary-800'
                                        }`}
                                    >
                                        <div className="relative">
                                            {/* User Avatar with Profile Picture */}
                                            <UserAvatar user={user} size="md" className="shadow-lg shadow-primary-500/30" />
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-secondary-900"></div>
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white max-w-[80px] truncate">
                                                {user?.first_name || user?.username || 'Account'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">My Account</p>
                                        </div>
                                        <HiChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-lg shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-secondary-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* User Info Header */}
                                            <div className="p-3 bg-gradient-to-r from-[#0b1326] to-primary-800 text-white">
                                                <div className="flex items-center gap-2">
                                                    {/* User Avatar in Dropdown */}
                                                    <UserAvatar user={user} size="lg" className="border-2 border-white/30" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">
                                                            {user?.first_name} {user?.last_name}
                                                        </p>
                                                        <p className="text-xs text-white/70 truncate">
                                                            {user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-1">
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineViewGrid className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">Dashboard</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Overview & stats</p>
                                                    </div>
                                                    <HiOutlineChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                </Link>

                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">Profile</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage your info</p>
                                                    </div>
                                                    <HiOutlineChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                </Link>

                                                <Link
                                                    to="/orders"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">My Orders</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Track your orders</p>
                                                    </div>
                                                    <HiOutlineChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                </Link>

                                                <Link
                                                    to="/wishlist"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/30 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineHeart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">Wishlist</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Saved items</p>
                                                    </div>
                                                    <HiOutlineChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                </Link>

                                                <Link
                                                    to="/dashboard/settings"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineCog className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">Settings</span>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Preferences</p>
                                                    </div>
                                                    <HiOutlineChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="p-1 border-t border-gray-100 dark:border-secondary-700">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 px-3 py-2 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors group text-sm"
                                                >
                                                    <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <HiOutlineLogout className="w-4 h-4 text-red-500" />
                                                    </div>
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 ml-1">
                                    <Link
                                        to="/login"
                                        className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 font-semibold transition-colors text-sm"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 text-sm"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-1 md:hidden">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                            >
                                <HiOutlineSearch className="w-4 h-4" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                            >
                                {isDark ? (
                                    <HiSun className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <HiMoon className="w-4 h-4 text-primary-400" />
                                )}
                            </button>

                            <button
                                onClick={() => dispatch(toggleCart())}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors relative"
                            >
                                <HiOutlineShoppingCart className="w-4 h-4" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-[#0b1326] to-primary-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                            >
                                {isMenuOpen ? (
                                    <HiOutlineX className="w-5 h-5" />
                                ) : (
                                    <HiOutlineMenu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="py-3 space-y-1 border-t border-gray-100 dark:border-secondary-800">
                            {/* Quick Contact - Mobile */}
                            <div className="flex items-center justify-center gap-3 py-2 mb-1 bg-gray-50 dark:bg-secondary-800 rounded-lg text-xs">
                                <a href="tel:+237683669723" className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <HiOutlinePhone className="w-3 h-3 text-primary-500" />
                                    <span>+237 683 669 723</span>
                                </a>
                                <div className="h-3 w-px bg-gray-300 dark:bg-secondary-600"></div>
                                <a
                                    href="https://wa.me/237683669723"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-green-600"
                                >
                                    <FaWhatsapp className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                </a>
                            </div>

                            {/* Nav Links */}
                            <Link
                                to="/products"
                                className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                    <HiOutlineShoppingBag className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-medium text-sm">Products</span>
                            </Link>

                            <Link
                                to="/about"
                                className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                    <HiOutlineInformationCircle className="w-4 h-4 text-teal-600" />
                                </div>
                                <span className="font-medium text-sm">About Us</span>
                            </Link>

                            <Link
                                to="/contact"
                                className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                    <HiOutlineMail className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-medium text-sm">Contact Us</span>
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <div className="h-px bg-gray-100 dark:bg-secondary-800 my-1"></div>

                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineViewGrid className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <span className="font-medium text-sm">Dashboard</span>
                                    </Link>

                                    <Link
                                        to="/orders"
                                        className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineShoppingBag className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <span className="font-medium text-sm">My Orders</span>
                                    </Link>

                                    <Link
                                        to="/wishlist"
                                        className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineHeart className="w-4 h-4 text-rose-600" />
                                        </div>
                                        <span className="font-medium text-sm">Wishlist</span>
                                    </Link>

                                    <Link
                                        to="/dashboard/notifications"
                                        className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineBell className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-sm flex-1">Notifications</span>
                                        {notificationCount > 0 && (
                                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                {notificationCount}
                                            </span>
                                        )}
                                    </Link>

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineUser className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <span className="font-medium text-sm">Profile</span>
                                    </Link>

                                    {/* User Info Card with Profile Picture */}
                                    <div className="mx-2 p-3 mt-1 bg-gradient-to-r from-[#0b1326] to-primary-800 rounded-lg text-white">
                                        <div className="flex items-center gap-2">
                                            <UserAvatar user={user} size="lg" className="border-2 border-white/30" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">
                                                    {user?.first_name} {user?.last_name}
                                                </p>
                                                <p className="text-xs text-white/60 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-2 px-3 py-2.5 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                            <HiOutlineLogout className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="font-medium text-sm">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 pt-2 px-2">
                                    <Link
                                        to="/login"
                                        className="flex-1 py-2 text-center border-2 border-gray-200 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex-1 py-2 text-center bg-gradient-to-r from-[#0b1326] to-primary-800 text-white rounded-lg font-semibold shadow-lg shadow-primary-500/30 text-sm"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <SmartSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;