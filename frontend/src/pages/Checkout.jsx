// src/pages/Checkout.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    HiArrowLeft,
    HiLockClosed,
    HiHome,
    HiLocationMarker,
    HiPhone,
    HiDocumentText,
    HiShoppingCart,
    HiTruck,
    HiCreditCard,
    HiCheckCircle,
    HiShieldCheck,
    HiGift
} from 'react-icons/hi';
import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
import { ordersAPI, couponsAPI } from '../api/api';
import { getImageUrl, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: user?.address || '',
        shipping_city: user?.city || '',
        shipping_country: user?.country || '',
        shipping_phone: user?.phone || '',
        notes: '',
    });

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState(null); // { code, discount_amount }
    const [couponLoading, setCouponLoading] = useState(false);

    // Calculate totals
    const discount = couponApplied ? parseFloat(couponApplied.discount_amount) : 0;
    const FREE_SHIPPING_THRESHOLD = 50000;
    const SHIPPING_COST = 3500;
    const TAX_RATE = 0.1925;
    const shippingCost = (cartTotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax = (cartTotal - discount) * TAX_RATE;
    const total = cartTotal - discount + shippingCost + tax;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        try {
            const res = await couponsAPI.validate(couponInput.trim(), cartTotal);
            setCouponApplied({ code: res.data.code, discount_amount: res.data.discount_amount });
            toast.success(`Coupon applied — saving ${res.data.discount_amount}!`);
        } catch (err) {
            const msg = err.response?.data?.code?.[0] || err.response?.data?.non_field_errors?.[0] || 'Invalid coupon.';
            toast.error(msg);
            setCouponApplied(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsLoading(true);

        try {
            const orderData = {
                ...formData,
                coupon_code: couponApplied?.code || '',
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
            };

            const response = await ordersAPI.create(orderData);
            dispatch(clearCart());
            toast.success('Order placed successfully!');
            navigate(`/orders/${response.data.id}`);
        } catch (error) {
            console.error('Order error:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.items?.[0]
                || error.response?.data?.detail
                || error.response?.data?.message
                || JSON.stringify(error.response?.data)
                || 'Failed to place order. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Empty Cart State
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="text-center max-w-sm w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <HiShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6">Looks like you haven't added any items yet.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                    >
                        <HiShoppingCart className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // Not Authenticated State
    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="text-center max-w-sm w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <HiLockClosed className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-400" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6">You need to be logged in to complete your purchase.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                    >
                        <HiLockClosed className="w-4 h-4" />
                        Login to Your Account
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="w-full px-3 sm:px-4 md:px-6 lg:w-[90%] max-w-7xl mx-auto py-2.5 sm:py-3 md:py-4">
                    <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-3 md:gap-4">
                        {[
                            { icon: HiShoppingCart, label: 'Cart', done: true },
                            { icon: HiTruck, label: 'Shipping', active: true },
                            { icon: HiCreditCard, label: 'Payment', done: false },
                            { icon: HiCheckCircle, label: 'Done', done: false },
                        ].map((step, idx) => (
                            <div key={idx} className="flex items-center">
                                <div className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                                    step.active
                                        ? 'text-primary-600'
                                        : step.done
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                }`}>
                                    <div className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                                        step.active
                                            ? 'bg-primary-100 text-primary-600'
                                            : step.done
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <step.icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                    </div>
                                    <span className="hidden sm:inline text-[10px] sm:text-xs md:text-sm font-medium">{step.label}</span>
                                </div>
                                {idx < 3 && (
                                    <div className={`w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 mx-0.5 xs:mx-1 sm:mx-1.5 md:mx-2 ${
                                        step.done ? 'bg-green-300' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full px-3 sm:px-4 md:px-6 lg:w-[90%] max-w-7xl mx-auto py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-primary-600 transition-colors mb-2 sm:mb-3 md:mb-4"
                    >
                        <HiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Back to Cart
                    </Link>
                    <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 md:gap-4">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] sm:text-xs md:text-sm font-medium rounded-full">
                            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete your order by providing shipping details</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Shipping Form - Takes 3 columns on large screens */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 lg:p-8 border border-gray-100">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <HiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Shipping Information</h2>
                                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Where should we send your order?</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
                                {/* Address */}
                                <div>
                                    <label htmlFor="shipping_address" className="flex items-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                                        <HiHome className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 text-gray-400" />
                                        Street Address <span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    <input
                                        id="shipping_address"
                                        type="text"
                                        name="shipping_address"
                                        value={formData.shipping_address}
                                        onChange={handleChange}
                                        placeholder="123 Main Street, Apt 4B"
                                        required
                                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                {/* City & Country - 2 columns */}
                                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                    <div>
                                        <label htmlFor="shipping_city" className="flex items-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                                            <HiLocationMarker className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 text-gray-400" />
                                            City <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <input
                                            id="shipping_city"
                                            type="text"
                                            name="shipping_city"
                                            value={formData.shipping_city}
                                            onChange={handleChange}
                                            placeholder="New York"
                                            required
                                            className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="shipping_country" className="flex items-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Country <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <input
                                            id="shipping_country"
                                            type="text"
                                            name="shipping_country"
                                            value={formData.shipping_country}
                                            onChange={handleChange}
                                            placeholder="United States"
                                            required
                                            className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="shipping_phone" className="flex items-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                                        <HiPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 text-gray-400" />
                                        Phone Number <span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    <input
                                        id="shipping_phone"
                                        type="tel"
                                        name="shipping_phone"
                                        value={formData.shipping_phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 123-4567"
                                        required
                                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="flex items-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 md:mb-2">
                                        <HiDocumentText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 text-gray-400" />
                                        Order Notes
                                        <span className="text-gray-400 ml-1 text-[10px] sm:text-xs font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Special delivery instructions..."
                                        rows={2}
                                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white resize-none"
                                    />
                                </div>

                                {/* Trust Badges - Mobile */}
                                <div className="grid grid-cols-2 gap-2 py-2 sm:py-3 md:hidden">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 p-1.5 sm:p-2 rounded-lg">
                                        <HiShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                        <span>Secure Checkout</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 p-1.5 sm:p-2 rounded-lg">
                                        <HiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 flex-shrink-0" />
                                        <span>Fast Delivery</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs sm:text-sm md:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiLockClosed className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                            <span>Passer la commande • {formatPrice(total)}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Trust Section - Desktop */}
                        <div className="hidden md:grid grid-cols-3 gap-4 mt-6">
                            {[
                                { icon: HiShieldCheck, title: 'Secure', desc: '256-bit SSL', color: 'green' },
                                { icon: HiTruck, title: 'Fast Delivery', desc: '2-5 business days', color: 'primary' },
                                { icon: HiGift, title: 'Gift Ready', desc: 'Free gift wrapping', color: 'primary' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100">
                                    <div className={`w-10 h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center`}>
                                        <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-gray-100 lg:sticky lg:top-24">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <HiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Order Summary</h2>
                                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">{cartItems.length} items in cart</p>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 md:mb-6 max-h-36 sm:max-h-48 md:max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-2 sm:gap-3 p-1.5 sm:p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                                <span className="text-[9px] sm:text-[10px] md:text-xs bg-gray-200 text-gray-600 px-1 sm:px-1.5 py-0.5 rounded">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">× {formatPrice(item.price)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[11px] sm:text-sm md:text-base font-bold text-primary-600">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon code */}
                            <div className="border-t border-gray-200 pt-3 sm:pt-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Coupon code"
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponInput.trim()}
                                        className="px-3 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponApplied && (
                                    <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs">
                                        <span className="text-green-700 font-medium">
                                            {couponApplied.code} applied!
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => { setCouponApplied(null); setCouponInput(''); }}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-2.5 md:space-y-3">
                                {/* Subtotal */}
                                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[11px] sm:text-xs md:text-sm text-green-600">
                                        <span>Discount ({couponApplied.code})</span>
                                        <span className="font-medium">-{formatPrice(discount)}</span>
                                    </div>
                                )}

                                {/* Shipping */}
                                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                        {shippingCost === 0 ? 'GRATUIT' : formatPrice(SHIPPING_COST)}
                                    </span>
                                </div>

                                {/* Tax */}
                                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm text-gray-600">
                                    <span>TVA (19,25%)</span>
                                    <span className="font-medium">{formatPrice(tax)}</span>
                                </div>

                                {/* Free Shipping Banner */}
                                {shippingCost > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-2.5 md:p-3 mt-2">
                                        <div className="flex items-start gap-1.5 sm:gap-2">
                                            <HiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] sm:text-xs text-amber-700">
                                                Ajoutez encore <span className="font-bold">{formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)}</span> pour la livraison gratuite !
                                            </p>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 bg-amber-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all"
                                                style={{ width: `${Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Free Shipping Achieved */}
                                {shippingCost === 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-2.5 md:p-3 mt-2">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <HiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                                            <p className="text-[10px] sm:text-xs text-green-700 font-medium">
                                                🎉 You've unlocked free shipping!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="border-t border-gray-200 pt-2.5 sm:pt-3 mt-2 sm:mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="mt-3 sm:mt-4 md:mt-6 bg-gray-50 rounded-lg p-2 sm:p-2.5 md:p-3 border border-gray-100">
                                <div className="flex items-start gap-2 sm:gap-2.5">
                                    <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-800">Secure Checkout</p>
                                        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5">Your payment info is encrypted and secure.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
                                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">We accept:</span>
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {['💳', '🏦', '📱'].map((icon, idx) => (
                                        <span key={idx} className="text-sm sm:text-base md:text-lg">{icon}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;