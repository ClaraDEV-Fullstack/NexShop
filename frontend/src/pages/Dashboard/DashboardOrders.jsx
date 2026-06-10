import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineEye,
    HiOutlineShoppingBag,
    HiOutlineArrowLeft,
    HiOutlineTrash,
    HiExclamation,
    HiOutlineFilter,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineRefresh,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineChevronDoubleLeft,
    HiOutlineChevronDoubleRight
} from 'react-icons/hi';
import { ordersAPI } from '../../api/api';
import { getImageUrl, formatPrice } from '../../utils/helpers';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const DashboardOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(8);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await ordersAPI.getAll();
            const data = response.data;
            setOrders(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

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
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            processing: 'bg-primary-100 text-primary-700 border-primary-200',
            shipped: 'bg-primary-100 text-primary-700 border-primary-200',
            delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <HiOutlineClock className="w-4 h-4" />,
            processing: <HiOutlineRefresh className="w-4 h-4" />,
            shipped: <HiOutlineTruck className="w-4 h-4" />,
            delivered: <HiOutlineCheckCircle className="w-4 h-4" />,
            cancelled: <HiOutlineXCircle className="w-4 h-4" />,
        };
        return icons[status] || icons.pending;
    };


    const getOrderItemImage = (item) => {
        if (item.product_image) {
            return getImageUrl(item.product_image);
        }
        if (item.image) {
            return getImageUrl(item.image);
        }
        if (item.product?.primary_image?.image) {
            return getImageUrl(item.product.primary_image.image);
        }
        if (item.product?.image) {
            return getImageUrl(item.product.image);
        }
        return null;
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);

    const filterButtons = [
        { key: 'all', label: 'All', icon: HiOutlineShoppingBag },
        { key: 'pending', label: 'Pending', icon: HiOutlineClock },
        { key: 'processing', label: 'Processing', icon: HiOutlineRefresh },
        { key: 'shipped', label: 'Shipped', icon: HiOutlineTruck },
        { key: 'delivered', label: 'Delivered', icon: HiOutlineCheckCircle },
    ];

    // Calculate stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
            {/* Confirmation Modal */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiExclamation className="w-8 h-8 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Order?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Order <span className="font-semibold text-gray-700">#{confirmId}</span> will be cancelled and items returned to stock.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmId(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                    disabled={cancellingId === confirmId}
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={() => handleCancelOrder(confirmId)}
                                    disabled={cancellingId === confirmId}
                                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {cancellingId === confirmId ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        'Yes, Cancel'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-container py-6 lg:py-8">
                {/* Back Button */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-medium mb-4 group transition-colors"
                >
                    <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">My Orders</h1>
                        <p className="text-gray-500 text-sm">Track and manage all your orders</p>
                    </div>

                    {/* Quick Stats - Compact */}
                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-amber-600">Pending</p>
                            <p className="text-lg font-bold text-amber-700">{stats.pending}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs text-emerald-600">Delivered</p>
                            <p className="text-lg font-bold text-emerald-700">{stats.delivered}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Section - Compact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <HiOutlineFilter className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 text-sm">Filter Orders</h2>
                                <p className="text-xs text-gray-500">{filteredOrders.length} orders found</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {filterButtons.map((btn) => {
                                const Icon = btn.icon;
                                return (
                                    <button
                                        key={btn.key}
                                        onClick={() => {
                                            setFilter(btn.key);
                                            setCurrentPage(1);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            filter === btn.key
                                                ? 'bg-gradient-to-r from-primary-600 to-primary-600 text-white shadow-md shadow-primary-500/25'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{btn.label}</span>
                                        {btn.key !== 'all' && (
                                            <span className={`text-xs px-1 py-0.5 rounded-md ${
                                                filter === btn.key ? 'bg-white/20' : 'bg-gray-200'
                                            }`}>
                                                {stats[btn.key] || 0}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Orders Grid - 2 per row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex justify-between gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-5 w-24 rounded-lg" />
                                        <Skeleton className="h-3.5 w-32 rounded-lg" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-14 rounded-lg" />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-3 border-t border-gray-100">
                                    <div className="flex -space-x-2">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <Skeleton className="h-3 w-16 mb-1.5 rounded" />
                                        <Skeleton className="h-2.5 w-32 rounded" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded-lg" />
                                </div>
                            </div>
                        ))
                    ) : currentOrders.length > 0 ? (
                        currentOrders.map((order, index) => {
                            const canCancel = ['pending', 'processing'].includes(order.status);

                            return (
                                <div
                                    key={order.id}
                                    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Order Header - Compact */}
                                    <div className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-primary-600 font-bold text-sm">#{order.id}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base group-hover:text-primary-600 transition-colors">
                                                        Order #{order.id}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-xs">
                                                        <HiOutlineCalendar className="w-3 h-3" />
                                                        <span>
                                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize">{order.status_display || order.status}</span>
                                                </div>
                                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white rounded-full">
                                                    <HiOutlineCurrencyDollar className="w-3 h-3" />
                                                    <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items - Compact */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100">
                                            {/* Product Images */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {order.items?.slice(0, 3).map((item, idx) => {
                                                        const imageUrl = getOrderItemImage(item);

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100"
                                                            >
                                                                {imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={item.product_name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg></div>';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <HiOutlineShoppingBag className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {order.items?.length > 3 && (
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Items Info */}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900">
                                                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                        {order.items?.slice(0, 2).map(item => item.product_name).join(', ')}
                                                        {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5">
                                                {canCancel && (
                                                    <button
                                                        onClick={() => setConfirmId(order.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Cancel</span>
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white rounded-lg transition-all shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30 font-medium text-xs"
                                                >
                                                    <HiOutlineEye className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                    <HiOutlineChevronRight className="w-3.5 h-3.5 -mr-1 opacity-70" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Progress Bar - Compact */}
                                    {!['cancelled', 'delivered'].includes(order.status) && (
                                        <div className="px-4 pb-3">
                                            <div className="flex items-center gap-1">
                                                {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                                                    const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                                                    const isActive = idx <= currentIndex;
                                                    const isCurrent = idx === currentIndex;

                                                    return (
                                                        <div key={step} className="flex-1 flex items-center">
                                                            <div className={`h-1 flex-1 rounded-full transition-all ${
                                                                isActive
                                                                    ? 'bg-gradient-to-r from-primary-500 to-primary-500'
                                                                    : 'bg-gray-200'
                                                            }`} />
                                                            {idx < 3 && (
                                                                <div className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                                                                    isActive ? 'bg-primary-500' : 'bg-gray-200'
                                                                }`} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-2 bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiOutlineShoppingBag className="w-8 h-8 text-primary-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                                </h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    {filter === 'all'
                                        ? "You haven't placed any orders yet. Start exploring our products!"
                                        : `You don't have any orders with "${filter}" status.`}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                    {filter !== 'all' && (
                                        <button
                                            onClick={() => setFilter('all')}
                                            className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            View All Orders
                                        </button>
                                    )}
                                    <Link
                                        to="/products"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white rounded-lg font-medium shadow-lg shadow-primary-500/25 transition-all text-sm"
                                    >
                                        <HiOutlineShoppingBag className="w-4 h-4" />
                                        Start Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && filteredOrders.length > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Showing {Math.min(indexOfFirstOrder + 1, filteredOrders.length)} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="First page"
                            >
                                <HiOutlineChevronDoubleLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous page"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? 'bg-gradient-to-r from-primary-600 to-primary-600 text-white shadow-md shadow-primary-500/25'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Next page"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Last page"
                            >
                                <HiOutlineChevronDoubleRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOrders;