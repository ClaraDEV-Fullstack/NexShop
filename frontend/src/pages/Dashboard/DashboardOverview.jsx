// src/pages/dashboard/DashboardOverview.jsx

import { useEffect, useState } from 'react';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    HiOutlineShoppingBag,
    HiOutlineHeart,
    HiOutlineCog,
    HiOutlineTruck,
    HiOutlineArrowRight,
    HiOutlineSparkles,
    HiOutlineBell,
    HiOutlineClipboardList,
    HiOutlineChevronRight,
    HiOutlineCube
} from 'react-icons/hi';
import api from '../../api/api';
import Skeleton from '../../components/ui/Skeleton';

const StatCard = ({ icon: Icon, label, value, color, bgColor, link, isLoading }) => (
    <Link
        to={link}
        className="group relative bg-white dark:bg-secondary-800 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-secondary-100 dark:border-secondary-700 overflow-hidden"
    >
        {/* Decorative gradient */}
        <div className={`absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 ${bgColor} rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity -translate-y-1/2 translate-x-1/2`} />

        <div className="relative flex items-start justify-between">
            <div className="space-y-0.5">
                {isLoading ? (
                    <>
                        <Skeleton className="h-7 md:h-8 w-14 md:w-16 mb-1 rounded" />
                        <Skeleton className="h-3 md:h-4 w-16 md:w-20 rounded" />
                    </>
                ) : (
                    <>
                        <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
                        <p className="text-secondary-500 dark:text-secondary-400 text-xs md:text-sm font-medium">{label}</p>
                    </>
                )}
            </div>
            <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${bgColor} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
            </div>
        </div>

        {/* Bottom accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </Link>
);

const QuickLinkCard = ({ icon: Icon, label, description, link, color, bgColor }) => (
    <Link
        to={link}
        className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-100 dark:border-secondary-700 hover:shadow-md hover:border-transparent transition-all"
    >
        <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl ${bgColor} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-105 transition-transform`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-secondary-900 dark:text-white text-sm md:text-base group-hover:text-primary-500 transition-colors">
                {label}
            </h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5 truncate">{description}</p>
        </div>
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center group-hover:bg-primary-500 transition-colors flex-shrink-0">
            <HiOutlineArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary-400 group-hover:text-white transition-colors" />
        </div>
    </Link>
);

const DashboardOverview = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        orders: 0,
        wishlist: 0,
        pending: 0,
        delivered: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                const ordersRes = await api.get('/orders/');
                const orders = ordersRes.data.results || ordersRes.data || [];

                const wishlistRes = await api.get('/wishlist/');
                const wishlist = wishlistRes.data.results || wishlistRes.data || [];

                setStats({
                    orders: orders.length,
                    wishlist: wishlist.length,
                    pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
                    delivered: orders.filter(o => o.status === 'delivered').length
                });

                setRecentOrders(orders.slice(0, 5));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            processing: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
            shipped: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
            delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800">
            <div className="page-container py-4 md:py-6 lg:py-8">
                <div className="space-y-4 md:space-y-6">

                    {/* Welcome Section - Compact */}
                    <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white overflow-hidden shadow-xl shadow-primary-500/15">
                        {/* Decorative Elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 md:w-72 h-48 md:h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                            <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-primary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                            {/* Pattern dots */}
                            <div className="absolute inset-0 opacity-10 hidden md:block">
                                <div className="absolute top-8 right-16 w-3 h-3 border-2 border-white rounded-full" />
                                <div className="absolute top-16 right-32 w-1.5 h-1.5 bg-white rounded-full" />
                                <div className="absolute bottom-8 right-24 w-2 h-2 border border-white rounded-full" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 md:mb-3">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                    <HiOutlineSparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-medium">{getGreeting()}</span>
                                </div>
                            </div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
                                Welcome back, {user?.first_name || user?.username}! 👋
                            </h1>
                            <p className="text-primary-100 text-xs md:text-sm lg:text-base max-w-lg">
                                Track your orders, manage your wishlist, and more.
                            </p>

                            {/* Quick action buttons */}
                            <div className="flex flex-wrap gap-2 mt-4 md:mt-5">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white text-primary-600 text-xs md:text-sm font-semibold rounded-lg hover:bg-primary-50 transition-colors shadow-md"
                                >
                                    Start Shopping
                                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <Link
                                    to="/dashboard/orders"
                                    className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-white/25 transition-colors"
                                >
                                    View Orders
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Compact */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                        <StatCard
                            icon={HiOutlineShoppingBag}
                            label="Total Orders"
                            value={stats.orders}
                            color="text-primary-600"
                            bgColor="bg-primary-500"
                            link="/dashboard/orders"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon={HiOutlineHeart}
                            label="Wishlist"
                            value={stats.wishlist}
                            color="text-amber-600"
                            bgColor="bg-amber-500"
                            link="/dashboard/wishlist"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon={HiOutlineTruck}
                            label="In Progress"
                            value={stats.pending}
                            color="text-primary-600"
                            bgColor="bg-primary-500"
                            link="/dashboard/orders"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon={HiOutlineClipboardList}
                            label="Delivered"
                            value={stats.delivered}
                            color="text-emerald-600"
                            bgColor="bg-emerald-500"
                            link="/dashboard/orders"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Quick Links - Compact */}
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-secondary-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                            <span className="w-0.5 h-4 md:h-5 bg-gradient-to-b from-primary-500 to-primary-500 rounded-full"></span>
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            <QuickLinkCard
                                icon={HiOutlineBell}
                                label="Notifications"
                                description="Check your latest updates"
                                link="/dashboard/notifications"
                                color="text-primary-600"
                                bgColor="bg-primary-500"
                            />
                            <QuickLinkCard
                                icon={HiOutlineCog}
                                label="Account Settings"
                                description="Manage your profile"
                                link="/dashboard/settings"
                                color="text-secondary-600"
                                bgColor="bg-secondary-500"
                            />
                        </div>
                    </div>

                    {/* Recent Orders - Compact */}
                    <div className="bg-white dark:bg-secondary-800 rounded-xl md:rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-700 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 md:p-4 lg:p-5 border-b border-secondary-100 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-white dark:from-secondary-800 dark:to-secondary-800">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary-500 to-primary-500 flex items-center justify-center shadow-md shadow-primary-500/20">
                                    <HiOutlineCube className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-lg font-bold text-secondary-900 dark:text-white">
                                        Recent Orders
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-secondary-500 dark:text-secondary-400">
                                        Track your purchases
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/dashboard/orders"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold rounded-lg transition-colors"
                            >
                                View All
                                <HiOutlineArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Orders List */}
                        <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="p-3 md:p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-4 w-20 md:w-24 rounded" />
                                                    <Skeleton className="h-3 w-16 md:w-20 rounded" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Skeleton className="h-4 w-12 md:w-16 rounded" />
                                                <Skeleton className="h-5 w-16 md:w-20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        to={`/orders/${order.id}`}
                                        className="group flex items-center justify-between p-3 md:p-4 hover:bg-primary-50/50 dark:hover:from-primary-900/10 transition-all"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-700 dark:to-secondary-600 flex items-center justify-center font-bold text-xs md:text-sm text-secondary-400 dark:text-secondary-300 group-hover:from-primary-100 group-hover:to-primary-50 group-hover:text-primary-500 transition-all">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs md:text-sm text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    Order #{order.id}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <span className="text-sm md:text-base font-bold text-secondary-900 dark:text-white">
                                                {formatPrice(order.total || 0)}
                                            </span>
                                            <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <HiOutlineChevronRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all hidden md:block" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 md:p-12 text-center">
                                    <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-700 dark:to-secondary-600 flex items-center justify-center">
                                        <HiOutlineShoppingBag className="w-7 h-7 md:w-8 md:h-8 text-secondary-400" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-secondary-900 dark:text-white mb-1">
                                        No orders yet
                                    </h3>
                                    <p className="text-xs md:text-sm text-secondary-500 dark:text-secondary-400 mb-4 max-w-xs mx-auto">
                                        Start shopping to see your orders here.
                                    </p>
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-700 shadow-md shadow-primary-500/20 transition-all"
                                    >
                                        Browse Products
                                        <HiOutlineArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile View All */}
                        {recentOrders.length > 0 && (
                            <div className="sm:hidden p-3 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50">
                                <Link
                                    to="/dashboard/orders"
                                    className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-primary-600 font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    View All Orders
                                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;