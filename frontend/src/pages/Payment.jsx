import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    HiArrowLeft, HiLockClosed, HiExclamation,
    HiTruck, HiCheckCircle, HiShoppingBag, HiMail,
} from 'react-icons/hi';
import { ordersAPI, paymentsAPI } from '../api/api';
import { getImageUrl, formatPrice } from '../utils/helpers';
import Loader from '../components/common/Loader';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const PROVIDERS = [
    {
        id: 'orange_money',
        label: 'Orange Money',
        description: 'Pay with your Orange Money wallet',
        accent: 'border-orange-500 bg-orange-50',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        badge: 'OM',
        badgeStyle: 'bg-orange-500',
    },
    {
        id: 'mtn_money',
        label: 'MTN Mobile Money',
        description: 'Pay with your MTN MoMo account',
        accent: 'border-yellow-500 bg-yellow-50',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-700',
        badge: 'MTN',
        badgeStyle: 'bg-yellow-500',
    },
];

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('orange_money');
    const [payerName, setPayerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (user) {
            const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
            setPayerName(name || user.username || '');
            setPhoneNumber(user.phone || order?.shipping_phone || '');
        }
    }, [user, order]);

    const fetchOrder = async () => {
        try {
            const response = await ordersAPI.getById(orderId);
            setOrder(response.data);
            if (response.data.payment_status === 'paid') {
                toast.success('This order is already paid');
                navigate(`/orders/${orderId}`);
            }
        } catch {
            toast.error('Failed to load order');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        if (!payerName.trim()) {
            return 'Please enter the account holder name.';
        }
        const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
        if (!cleaned || cleaned.replace('+', '').length < 9) {
            return 'Please enter a valid mobile money phone number.';
        }
        return null;
    };

    const handlePay = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            const response = await paymentsAPI.initiate({
                orderId: parseInt(orderId, 10),
                paymentMethod: selectedProvider,
                phoneNumber: phoneNumber.trim(),
                payerName: payerName.trim(),
            });

            const data = response.data;

            if (data.payment_url && !data.mock) {
                window.location.href = data.payment_url;
                return;
            }

            setSuccessData(data);
            setShowSuccessModal(true);
            window.dispatchEvent(new CustomEvent('notifications:refresh'));

            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#f59e0b', '#3b82f6'],
            });
        } catch (err) {
            const data = err.response?.data;
            let msg = 'Failed to process payment. Please try again.';

            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                msg = 'Payment timed out. Please check your order — it may still have been processed.';
            } else if (data) {
                if (typeof data.error === 'string') {
                    msg = data.error;
                } else if (data.detail) {
                    msg = data.detail;
                } else if (data.order_id?.[0]) {
                    msg = data.order_id[0];
                } else if (data.phone_number?.[0]) {
                    msg = data.phone_number[0];
                } else if (data.payment_method?.[0]) {
                    msg = data.payment_method[0];
                }
            }

            setError(msg);
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedProviderInfo = PROVIDERS.find((p) => p.id === selectedProvider);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-50">
                <Loader size="lg" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 to-primary-50">
                <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-lg p-10">
                    <HiExclamation className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <Link to="/orders" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium">
                        <HiArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-50">
                <div className="page-container py-8 lg:py-12">
                    <div className="mb-8">
                        <Link to={`/orders/${orderId}`} className="group inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
                            <HiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Order
                        </Link>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Mobile Money Payment</h1>
                                <p className="text-sm text-gray-600">Pay for Order #{order.id} via Orange Money or MTN MoMo</p>
                            </div>
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                                Total: {formatPrice(order.total)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
                        <div className="order-2 lg:order-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary-100">
                                <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700">
                                    <h2 className="text-lg font-bold text-white">Choose Mobile Money Provider</h2>
                                    <p className="text-primary-100 text-xs mt-1">Orange Money or MTN MoMo only</p>
                                </div>

                                <div className="p-6 space-y-3">
                                    {PROVIDERS.map((provider) => (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => setSelectedProvider(provider.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                                selectedProvider === provider.id
                                                    ? provider.accent
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${provider.badgeStyle}`}>
                                                {provider.badge}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm text-gray-900">{provider.label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{provider.description}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedProvider === provider.id
                                                    ? 'border-primary-500 bg-primary-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedProvider === provider.id && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 space-y-4">
                                <h3 className="font-bold text-gray-900">Payment Details</h3>

                                <div>
                                    <label htmlFor="payerName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Account holder name
                                    </label>
                                    <input
                                        id="payerName"
                                        type="text"
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        placeholder="Full name on mobile money account"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        {selectedProviderInfo?.label} phone number
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="e.g. +237 6XX XXX XXX"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                                        <HiExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handlePay}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing payment…
                                        </>
                                    ) : (
                                        <>
                                            <HiLockClosed className="w-5 h-5" />
                                            Pay {formatPrice(order.total)}
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 leading-relaxed">
                                    Demo checkout for now — no real payment is processed.
                                    Live mobile money integration will be enabled in production.
                                </p>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary-100 lg:sticky lg:top-6">
                                <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <HiTruck className="w-6 h-6" />
                                        Order Summary
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                                    <img
                                                        src={getImageUrl(item.product_image)}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate text-sm">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {item.product_price}</p>
                                                </div>
                                                <p className="font-bold text-primary-600 text-sm flex-shrink-0">{item.subtotal}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{order.subtotal}</span>
                                        </div>
                                        {parseFloat(order.discount) > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-{order.discount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span className={parseFloat(order.shipping_cost) === 0 ? 'text-green-600' : ''}>
                                                {parseFloat(order.shipping_cost) === 0 ? 'Free' : order.shipping_cost}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Tax</span>
                                            <span>{order.tax}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-primary-600">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                            <HiTruck className="w-4 h-4 text-primary-600" />
                                            Shipping To
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                            <p>{order.shipping_address}</p>
                                            <p>{order.shipping_city}, {order.shipping_country}</p>
                                            <p className="text-gray-500 mt-1">{order.shipping_phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={showSuccessModal} onClose={() => navigate(`/orders/${orderId}`)} size="md">
                <div className="text-center -mt-2">
                    <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <HiCheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your {successData?.payment_method_label || 'mobile money'} payment was processed successfully.
                    </p>

                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-5">
                        <p className="text-sm text-gray-500 mb-1">Amount paid</p>
                        <p className="text-3xl font-bold text-green-600">
                            {formatPrice(successData?.amount || order.total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-3 font-mono">
                            Ref: {successData?.transaction_id}
                        </p>
                    </div>

                    <div className={`flex items-center justify-center gap-2 text-sm mb-6 rounded-xl p-3 ${
                        successData?.email_sent
                            ? 'text-gray-600 bg-primary-50'
                            : 'text-amber-800 bg-amber-50 border border-amber-200'
                    }`}>
                        <HiMail className={`w-5 h-5 flex-shrink-0 ${successData?.email_sent ? 'text-primary-500' : 'text-amber-600'}`} />
                        <span>
                            {successData?.email_sent
                                ? 'A confirmation email has been sent to your inbox.'
                                : 'Payment recorded, but email could not be sent. Check your notification bell for order updates.'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to={`/orders/${orderId}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition"
                        >
                            <HiShoppingBag className="w-5 h-5" />
                            View Order
                        </Link>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Payment;
