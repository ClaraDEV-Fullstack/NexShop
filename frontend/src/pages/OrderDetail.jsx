// src/pages/OrderDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiArrowLeft,
    HiCheckCircle,
    HiExclamation,
    HiTrash,
    HiLockClosed,
    HiLocationMarker,
    HiCreditCard,
    HiCube,
    HiTruck,
    HiShieldCheck,
    HiClock,
    HiPhone,
    HiDocumentText,
    HiChevronRight,
    HiCalendar,
    HiClipboardList,
    HiSupport,
    HiX
} from 'react-icons/hi';
import { ordersAPI } from '../api/api';
import { getImageUrl, formatPrice } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(id);
                console.log('Order data:', response.data);
                console.log('Order items:', response.data.items);
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        setIsCancelling(true);
        try {
            const response = await ordersAPI.cancel(id);
            setOrder(response.data);
            toast.success('Order cancelled successfully');
            setShowConfirm(false);
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Failed to cancel order';
            toast.error(errorMsg);
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-500',
            processing: 'bg-primary-500',
            shipped: 'bg-primary-500',
            delivered: 'bg-emerald-500',
            cancelled: 'bg-gray-400',
        };
        return colors[status] || 'bg-gray-400';
    };

    const getStatusBgColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            processing: 'bg-primary-50 text-primary-700 border-primary-200',
            shipped: 'bg-primary-50 text-primary-700 border-primary-200',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: HiClock,
            processing: HiCube,
            shipped: HiTruck,
            delivered: HiCheckCircle,
            cancelled: HiX,
        };
        return icons[status] || HiClock;
    };

    const orderSteps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = orderSteps.indexOf(order?.status);
    const canCancel = order && order.status === 'pending';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg shadow-gray-200/50 flex items-center justify-center mx-auto mb-3">
                        <Loader size="sm" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Loading order...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-200/50">
                        <HiDocumentText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-500 text-sm mb-6">The order you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const StatusIcon = getStatusIcon(order.status);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <HiExclamation className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel This Order?</h3>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Order <span className="font-semibold text-gray-700">#{order.id}</span> will be cancelled and items will be returned to stock.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
                                disabled={isCancelling}
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/25"
                            >
                                {isCancelling ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <HiTrash className="w-4 h-4" />
                                        Cancel
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="py-3 sm:py-4">
                        <Link
                            to="/orders"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
                        >
                            <HiArrowLeft className="w-3.5 h-3.5" />
                            All Orders
                        </Link>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    order.status === 'cancelled' ? 'bg-gray-100' :
                                        order.status === 'delivered' ? 'bg-emerald-100' :
                                            order.status === 'shipped' ? 'bg-primary-100' :
                                                order.status === 'processing' ? 'bg-primary-100' : 'bg-amber-100'
                                }`}>
                                    <StatusIcon className={`w-5 h-5 ${
                                        order.status === 'cancelled' ? 'text-gray-500' :
                                            order.status === 'delivered' ? 'text-emerald-600' :
                                                order.status === 'shipped' ? 'text-primary-600' :
                                                    order.status === 'processing' ? 'text-primary-600' : 'text-amber-600'
                                    }`} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-base sm:text-lg font-bold text-gray-900">#{order.id}</h1>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold border ${getStatusBgColor(order.status)}`}>
                                            {order.status_display || order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <HiCalendar className="w-3.5 h-3.5" />
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                                <p className="text-xs text-gray-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                {/* Status Alerts */}
                {order.status === 'pending' && (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl mb-4 text-white shadow-lg shadow-emerald-500/20">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                            <HiCheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base">Order Confirmed!</p>
                            <p className="text-xs sm:text-sm text-emerald-100">We'll notify you when it ships.</p>
                        </div>
                        {order.payment_status === 'pending' && (
                            <Link
                                to={`/payment/${order.id}`}
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition-colors flex-shrink-0"
                            >
                                <HiLockClosed className="w-4 h-4" />
                                Pay Now
                            </Link>
                        )}
                    </div>
                )}

                {order.status === 'cancelled' && (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-100 rounded-xl mb-4 border border-gray-200">
                        <div className="w-10 h-10 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiX className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 text-sm sm:text-base">Order Cancelled</p>
                            <p className="text-xs sm:text-sm text-gray-500">Items have been returned to stock.</p>
                        </div>
                    </div>
                )}

                {order.status === 'delivered' && (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mb-4 text-white shadow-lg shadow-emerald-500/20">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                            <HiCheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm sm:text-base">Delivered Successfully!</p>
                            <p className="text-xs sm:text-sm text-emerald-100">Thank you for your order.</p>
                        </div>
                    </div>
                )}

                {/* Progress Tracker */}
                {order.status !== 'cancelled' && (
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line Background */}
                            <div className="absolute top-4 sm:top-5 left-0 right-0 h-1 bg-gray-100 rounded-full mx-8 sm:mx-12" />
                            {/* Progress Line Active */}
                            <div
                                className={`absolute top-4 sm:top-5 left-0 h-1 ${getStatusColor(order.status)} rounded-full mx-8 sm:mx-12 transition-all duration-500`}
                                style={{
                                    width: `calc(${(currentStepIndex / (orderSteps.length - 1)) * 100}% - ${currentStepIndex === 0 ? '0px' : '4rem'})`,
                                    maxWidth: currentStepIndex === orderSteps.length - 1 ? 'calc(100% - 4rem)' : undefined
                                }}
                            />

                            {orderSteps.map((step, index) => (
                                <div key={step} className="flex flex-col items-center z-10 flex-1">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                        index <= currentStepIndex
                                            ? `${getStatusColor(order.status)} text-white shadow-lg`
                                            : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {index === 0 && <HiClock className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        {index === 1 && <HiCube className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        {index === 2 && <HiTruck className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        {index === 3 && <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </div>
                                    <span className={`text-[10px] sm:text-xs mt-2 font-medium capitalize text-center ${
                                        index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Items & Details */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <HiClipboardList className="w-4 h-4 text-gray-400" />
                                    <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
                                </div>
                                <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                                    {order.items?.length || 0} items
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {order.items?.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                    >
                                        {/* Product Image */}
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img
                                                src={getImageUrl(item.product_image)}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNODAgODVIMTIwVjExNUg4MFY4NVoiIGZpbGw9IiNEMUQ1REIiLz48cGF0aCBkPSJNNzAgMTI1SDEzMFYxMzBINzBWMTI1WiIgZmlsbD0iI0QxRDVEQiIvPjwvc3ZnPg==';
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {item.product_slug ? (
                                                <Link
                                                    to={`/products/${item.product_slug}`}
                                                    className="font-semibold text-gray-900 hover:text-primary-600 text-sm line-clamp-1 transition-colors"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-gray-900 text-sm line-clamp-1">
                                                    {item.product_name}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatPrice(item.product_price)} × {item.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-gray-900 text-sm sm:text-base">{formatPrice(item.subtotal)}</p>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                        </div>

                                        {item.product_slug && (
                                            <Link
                                                to={`/products/${item.product_slug}`}
                                                className="p-2 text-gray-300 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all hidden sm:block"
                                            >
                                                <HiChevronRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Details */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-semibold text-gray-900">Shipping & Payment</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                {/* Shipping Address */}
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <HiLocationMarker className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Shipping To</p>
                                            <p className="font-semibold text-gray-900 text-sm">{order.shipping_address}</p>
                                            <p className="text-sm text-gray-600">{order.shipping_city}, {order.shipping_country}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-lg">
                                                <HiPhone className="w-3.5 h-3.5" />
                                                {order.shipping_phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            order.payment_status === 'paid'
                                                ? 'bg-gradient-to-br from-emerald-100 to-emerald-50'
                                                : 'bg-gradient-to-br from-amber-100 to-amber-50'
                                        }`}>
                                            <HiCreditCard className={`w-5 h-5 ${
                                                order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold text-sm ${
                                                    order.payment_status === 'paid' ? 'text-emerald-600' :
                                                        order.payment_status === 'pending' ? 'text-amber-600' : 'text-gray-600'
                                                }`}>
                                                    {order.payment_status_display || order.payment_status}
                                                </p>
                                                {order.payment_status === 'paid' && (
                                                    <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {order.payment_method || 'Online Payment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <HiDocumentText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Order Notes</p>
                                            <p className="text-sm text-gray-700">{order.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-4">
                        {/* Order Summary */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
                            </div>

                            <div className="p-4">
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900 font-medium">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Shipping</span>
                                        <span className={parseFloat(order.shipping_cost) === 0 ? 'text-emerald-600 font-semibold' : 'text-gray-900 font-medium'}>
                                            {parseFloat(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Tax</span>
                                        <span className="text-gray-900 font-medium">{formatPrice(order.tax)}</span>
                                    </div>

                                    <div className="h-px bg-gray-100 my-3" />

                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2.5">
                            {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                                <Link
                                    to={`/payment/${order.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 transition-all text-sm"
                                >
                                    <HiLockClosed className="w-4 h-4" />
                                    Payer {formatPrice(order.total)}
                                </Link>
                            )}

                            {canCancel && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-gray-200 hover:border-red-200"
                                >
                                    <HiTrash className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            )}

                            <Link
                                to="/orders"
                                className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm hover:bg-gray-100"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back to Orders
                            </Link>
                        </div>

                        {/* Trust & Support */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 space-y-3">
                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <HiShieldCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Secure & Protected</p>
                                    <p className="text-gray-500">Your data is encrypted</p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <HiSupport className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">Need Help?</p>
                                        <p className="text-[10px] text-gray-500">We're here 24/7</p>
                                    </div>
                                </div>
                                <Link
                                    to="/contact"
                                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    Contact
                                    <HiChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;