import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiShoppingBag,
    HiEye,
    HiTrash,
    HiExclamation,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineRefresh,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineShoppingCart,
    HiArrowRight
} from 'react-icons/hi';
import { ordersAPI } from '../api/api';
import { getImageUrl, formatPrice } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// Order Item Image Component
const OrderItemImage = ({ item, getOrderItemImage }) => {
    const [hasError, setHasError] = useState(false);
    const imageUrl = getOrderItemImage(item);

    return (
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
            {imageUrl && !hasError ? (
                <img
                    src={imageUrl}
                    alt={item.product_name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <HiShoppingBag className="w-4 h-4 text-gray-400" />
                </div>
            )}
        </div>
    );
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            const data = response.data;
            setOrders(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = orders.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
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
    };

    const handleCancelOrder = async (orderId) => {
        setCancellingId(orderId);
        try {
            await ordersAPI.cancel(orderId);
            toast.success('Order cancelled successfully');
            fetchOrders();
            setConfirmId(null);
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Failed to cancel order';
            toast.error(errorMsg);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            processing: 'bg-primary-50 text-primary-700 border-primary-200',
            shipped: 'bg-primary-50 text-primary-700 border-primary-200',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <HiOutlineClock className="w-3 h-3" />,
            processing: <HiOutlineRefresh className="w-3 h-3" />,
            shipped: <HiOutlineTruck className="w-3 h-3" />,
            delivered: <HiOutlineCheckCircle className="w-3 h-3" />,
            cancelled: <HiOutlineXCircle className="w-3 h-3" />,
        };
        return icons[status] || icons.pending;
    };

    const getOrderItemImage = (item) => {
        if (item.product_image) return getImageUrl(item.product_image);
        if (item.image) return getImageUrl(item.image);
        if (item.product?.primary_image?.image) return getImageUrl(item.product.primary_image.image);
        if (item.product?.image) return getImageUrl(item.product.image);
        return null;
    };

    // Calculate stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => ['processing', 'shipped'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                        <Loader size="md" />
                    </div>
                    <p className="text-gray-500 text-sm">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Modal */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiExclamation className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Cancel Order?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Order <span className="font-semibold">#{confirmId}</span> will be cancelled.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmId(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                    disabled={cancellingId === confirmId}
                                >
                                    Keep
                                </button>
                                <button
                                    onClick={() => handleCancelOrder(confirmId)}
                                    disabled={cancellingId === confirmId}
                                    className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {cancellingId === confirmId ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Cancelling</span>
                                        </>
                                    ) : (
                                        'Cancel Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Header - Compact */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="max-w-6xl mx-auto px-4 py-5 md:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">My Orders</h1>
                            <p className="text-primary-100 text-sm mt-0.5">
                                Track and manage your orders
                            </p>
                        </div>

                        {/* Stats - Compact */}
                        {orders.length > 0 && (
                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-center">
                                    <p className="text-lg font-bold">{stats.total}</p>
                                    <p className="text-[10px] text-primary-200">Total</p>
                                </div>
                                <div className="px-3 py-1.5 bg-amber-500/20 backdrop-blur-sm rounded-lg text-center">
                                    <p className="text-lg font-bold text-amber-200">{stats.pending}</p>
                                    <p className="text-[10px] text-amber-200/70">Pending</p>
                                </div>
                                <div className="px-3 py-1.5 bg-primary-400/20 backdrop-blur-sm rounded-lg text-center">
                                    <p className="text-lg font-bold text-primary-200">{stats.inProgress}</p>
                                    <p className="text-[10px] text-primary-200/70">Transit</p>
                                </div>
                                <div className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-lg text-center">
                                    <p className="text-lg font-bold text-emerald-200">{stats.delivered}</p>
                                    <p className="text-[10px] text-emerald-200/70">Done</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Curved Bottom - Smaller */}
                <div className="h-3">
                    <svg viewBox="0 0 1440 12" fill="none" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M0 12h1440V0c-211.5 8-435.7 12-672 12S211.5 8 0 0v12z" className="fill-gray-50" />
                    </svg>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                        <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineShoppingCart className="w-8 h-8 text-primary-500" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Start exploring our products and make your first purchase!
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all text-sm"
                            >
                                <HiShoppingBag className="w-4 h-4" />
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Orders Grid - 2x2 Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentOrders.map((order) => {
                                const canCancel = ['pending', 'processing'].includes(order.status);

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all overflow-hidden"
                                    >
                                        <div className="p-4">
                                            {/* Order Header */}
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-xs">#{order.id}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-sm">
                                                            Order #{order.id}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <HiOutlineCalendar className="w-3 h-3" />
                                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="capitalize">{order.status_display || order.status}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="flex -space-x-2">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <OrderItemImage
                                                                key={item.id || idx}
                                                                item={item}
                                                                getOrderItemImage={getOrderItemImage}
                                                            />
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-900 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                                                                +{order.items.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-gray-900">
                                                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate max-w-[100px]">
                                                            {order.items[0]?.product_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5">
                                                    {canCancel && (
                                                        <button
                                                            onClick={() => setConfirmId(order.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Cancel Order"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/orders/${order.id}`}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all text-xs font-medium"
                                                    >
                                                        <HiEye className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">View</span>
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Progress Bar - Compact */}
                                            {!['cancelled', 'delivered'].includes(order.status) && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-0.5">
                                                        {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                                                            const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                                                            const isActive = idx <= currentIndex;

                                                            return (
                                                                <div key={step} className="flex-1">
                                                                    <div className={`h-1 rounded-full ${
                                                                        isActive ? 'bg-primary-500' : 'bg-gray-200'
                                                                    }`} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-[9px] text-gray-400">Order Placed</span>
                                                        <span className="text-[9px] text-gray-400">Delivered</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex flex-col items-center gap-3">
                                <p className="text-xs text-gray-500">
                                    Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg border transition-all ${
                                            currentPage === 1
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                                        }`}
                                    >
                                        <HiOutlineChevronLeft className="w-4 h-4" />
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">
                                                ···
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
                                                    currentPage === page
                                                        ? 'bg-primary-600 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg border transition-all ${
                                            currentPage === totalPages
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                                        }`}
                                    >
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions - Compact */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Link
                                to="/products"
                                className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all"
                            >
                                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <HiShoppingBag className="w-4 h-4 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">Continue Shopping</p>
                                    <p className="text-xs text-gray-500 truncate">Browse products</p>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </Link>

                            <Link
                                to="/dashboard"
                                className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all"
                            >
                                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">Dashboard</p>
                                    <p className="text-xs text-gray-500 truncate">Your account</p>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            </Link>

                            <Link
                                to="/contact"
                                className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all"
                            >
                                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <HiExclamation className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">Need Help?</p>
                                    <p className="text-xs text-gray-500 truncate">Contact support</p>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;