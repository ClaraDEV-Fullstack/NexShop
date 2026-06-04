import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    HiArrowLeft, HiLockClosed, HiCreditCard, HiExclamation,
    HiShieldCheck, HiTruck, HiCurrencyDollar, HiDeviceMobile,
} from 'react-icons/hi';
import { ordersAPI, paymentsAPI } from '../api/api';
import { getImageUrl } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const CHANNELS = [
    {
        id: 'ALL',
        label: 'All payment methods',
        description: 'Card, Orange Money, MTN MoMo, Wave & more',
        icon: HiCurrencyDollar,
        color: 'blue',
    },
    {
        id: 'CREDIT_CARD',
        label: 'Visa / Mastercard',
        description: 'Pay with your debit or credit card',
        icon: HiCreditCard,
        color: 'indigo',
    },
    {
        id: 'MOBILE_MONEY',
        label: 'Mobile Money',
        description: 'Orange Money · MTN MoMo · Wave · Moov',
        icon: HiDeviceMobile,
        color: 'orange',
    },
];

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState('ALL');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

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

    const handlePay = async () => {
        setError(null);
        setIsProcessing(true);
        try {
            const response = await paymentsAPI.initiate(parseInt(orderId), selectedChannel);
            const { payment_url } = response.data;
            // Redirect to CinetPay hosted checkout
            window.location.href = payment_url;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to initiate payment. Please try again.';
            setError(msg);
            toast.error(msg);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <Loader size="lg" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-lg p-10">
                    <HiExclamation className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        <HiArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="w-full px-4 md:px-6 lg:px-8 py-8 lg:py-12 max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <Link to={`/orders/${orderId}`} className="group inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4">
                        <HiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Order
                    </Link>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Secure Payment</h1>
                            <p className="text-sm text-gray-600">Complete payment for Order #{order.id}</p>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <HiCurrencyDollar className="w-4 h-4 mr-2" />
                            Total: {order.total} XOF
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">

                    {/* Payment method selector */}
                    <div className="order-2 lg:order-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
                            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <HiCreditCard className="w-6 h-6" />
                                    Choose Payment Method
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">Powered by CinetPay — secure & encrypted</p>
                            </div>

                            <div className="p-6 space-y-3">
                                {CHANNELS.map(({ id, label, description, icon: Icon, color }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setSelectedChannel(id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                                            ${selectedChannel === id
                                                ? `border-${color}-500 bg-${color}-50`
                                                : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                    >
                                        <div className={`p-2.5 rounded-full ${selectedChannel === id ? `bg-${color}-100` : 'bg-gray-100'}`}>
                                            <Icon className={`w-6 h-6 ${selectedChannel === id ? `text-${color}-600` : 'text-gray-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold text-sm ${selectedChannel === id ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${selectedChannel === id ? `border-${color}-500 bg-${color}-500` : 'border-gray-300'}`}>
                                            {selectedChannel === id && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                                        <HiExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handlePay}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Redirecting to CinetPay…
                                        </>
                                    ) : (
                                        <>
                                            <HiLockClosed className="w-5 h-5" />
                                            Pay {order.total} XOF
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 pt-1">
                                    <HiShieldCheck className="w-4 h-4 text-green-500" />
                                    Your payment is processed securely by CinetPay
                                </p>
                            </div>
                        </div>

                        {/* Accepted payment logos */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-500 text-center mb-3">Accepted payment methods</p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium">
                                {['Visa', 'Mastercard', 'Orange Money', 'MTN MoMo', 'Wave', 'Moov'].map(m => (
                                    <span key={m} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 lg:sticky lg:top-6">
                            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700">
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
                                            <p className="font-bold text-blue-600 text-sm flex-shrink-0">{item.subtotal}</p>
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
                                            <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
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
                                        <span className="text-2xl font-bold text-blue-600">{order.total} XOF</span>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-200">
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                        <HiTruck className="w-4 h-4 text-blue-600" />
                                        Shipping To:
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
    );
};

export default Payment;
