// src/pages/Cart.jsx

import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiTrash, HiMinus, HiPlus, HiArrowLeft, HiShoppingBag, HiShieldCheck, HiTruck, HiRefresh, HiArrowRight } from 'react-icons/hi';
import {
    selectCartItems,
    selectCartTotal,
    removeFromCart,
    updateQuantity,
    clearCart
} from '../store/cartSlice';
import { getImageUrl, formatPrice } from '../utils/helpers';

const Cart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    // Calculate totals (XAF: free shipping above 50,000 FCFA, shipping 3,500 FCFA, VAT 19.25%)
    const FREE_SHIPPING_THRESHOLD = 50000;
    const SHIPPING_COST = 3500;
    const TAX_RATE = 0.1925;
    const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax = cartTotal * TAX_RATE;
    const total = cartTotal + shippingCost + tax;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
                    {/* Empty Cart Icon */}
                    <div className="relative inline-block mb-6 sm:mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-400 rounded-full blur-2xl opacity-20 scale-150"></div>
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary-100 to-primary-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-primary-200/50">
                            <HiShoppingBag className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary-400" />
                        </div>
                        {/* Floating Elements */}
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <span className="text-white text-[10px] sm:text-xs font-bold">0</span>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-primary-800 to-gray-800 bg-clip-text text-transparent mb-3 sm:mb-4">
                        Your Cart is Empty
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 max-w-md mx-auto px-4">
                        Looks like you haven't added any items yet. Start exploring our amazing products!
                    </p>

                    <Link
                        to="/products"
                        className="group inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary-600 to-primary-600 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
                    >
                        <HiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                        Start Shopping
                        <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Features */}
                    <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto">
                        {[
                            { icon: HiTruck, title: 'Free Shipping', desc: 'On orders over $50' },
                            { icon: HiShieldCheck, title: 'Secure Payment', desc: '100% protected' },
                            { icon: HiRefresh, title: 'Easy Returns', desc: '30-day return policy' }
                        ].map((feature, i) => (
                            <div key={i} className="p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100">
                                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500 mx-auto mb-1.5 sm:mb-2" />
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">{feature.title}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-40 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-40 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-primary-800 to-gray-800 bg-clip-text text-transparent">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(clearCart())}
                        className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg sm:rounded-xl border border-red-200 hover:border-red-500 transition-all duration-300"
                    >
                        <HiTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">Clear Cart</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-primary-200/30 hover:border-primary-100 transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex gap-3 sm:gap-4 md:gap-5">
                                    {/* Product Image */}
                                    <Link
                                        to={`/products/${item.slug}`}
                                        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50"
                                    >
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                to={`/products/${item.slug}`}
                                                className="font-semibold text-gray-800 hover:text-primary-600 text-sm sm:text-base line-clamp-2 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
                                                    {formatPrice(item.price)}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-gray-400">each</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                                    className="p-1.5 sm:p-2 md:p-2.5 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <HiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </button>
                                                <span className="px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm font-bold text-gray-800 min-w-[32px] sm:min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                    className="p-1.5 sm:p-2 md:p-2.5 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
                                                >
                                                    <HiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => dispatch(removeFromCart(item.id))}
                                                className="p-1.5 sm:p-2 md:p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-300"
                                            >
                                                <HiTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total - Desktop */}
                                    <div className="hidden sm:flex flex-col items-end justify-between">
                                        <div className="text-right">
                                            <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Total</p>
                                            <p className="text-lg sm:text-xl font-bold text-gray-800">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Item Total */}
                                <div className="sm:hidden flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Subtotal</span>
                                    <span className="text-base font-bold text-gray-800">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 sm:top-24">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-primary-600 p-4 sm:p-5 md:p-6">
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Order Summary</h2>
                                    <p className="text-primary-100 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">Review your order details</p>
                                </div>

                                <div className="p-4 sm:p-5 md:p-6">
                                    {/* Summary Items */}
                                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-800">{formatPrice(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5 sm:gap-2">
                                                <HiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                Shipping
                                            </span>
                                            <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                                {shippingCost === 0 ? 'Free' : formatPrice(SHIPPING_COST)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                            <span>Tax (19.25%)</span>
                                            <span className="font-medium text-gray-800">{formatPrice(tax)}</span>
                                        </div>

                                        {/* Free Shipping Progress */}
                                        {cartTotal < FREE_SHIPPING_THRESHOLD && (
                                            <div className="bg-primary-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
                                                <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm mb-1.5 sm:mb-2">
                                                    <span className="text-primary-700 font-medium">Free shipping on orders over 50,000 FCFA</span>
                                                    <span className="text-primary-600">{formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)} to go</span>
                                                </div>
                                                <div className="h-1.5 sm:h-2 bg-primary-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary-500 to-primary-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Free Shipping Achieved */}
                                        {cartTotal >= FREE_SHIPPING_THRESHOLD && (
                                            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4 border border-green-200">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span className="text-[10px] sm:text-xs md:text-sm font-medium">🎉 You've unlocked free shipping!</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-dashed border-gray-200 pt-3 sm:pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm sm:text-base md:text-lg font-bold text-gray-800">Total</span>
                                                <div className="text-right">
                                                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
                                                        {formatPrice(total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checkout Button - NOW FUNCTIONAL */}
                                    <Link
                                        to="/checkout"
                                        className="group w-full py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary-600 to-primary-600 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        Proceed to Checkout
                                        <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    {/* Continue Shopping */}
                                    <Link
                                        to="/products"
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 py-2 sm:py-3 text-gray-500 hover:text-primary-600 text-xs sm:text-sm font-medium transition-colors"
                                    >
                                        <HiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Continue Shopping
                                    </Link>

                                    {/* Trust Badges */}
                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                                            <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs">
                                                <HiShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                                                Secure Checkout
                                            </div>
                                            <div className="w-px h-3 sm:h-4 bg-gray-200 hidden sm:block"></div>
                                            <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs">
                                                <HiRefresh className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                                                Easy Returns
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100">
                                <p className="text-[10px] sm:text-xs text-gray-400 text-center mb-2 sm:mb-3">We accept</p>
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {['Visa', 'MC', 'Amex', 'PayPal'].map((method) => (
                                        <div key={method} className="w-10 h-6 sm:w-12 sm:h-8 bg-gray-100 rounded-md sm:rounded-lg flex items-center justify-center">
                                            <span className="text-[9px] sm:text-xs font-bold text-gray-400">{method}</span>
                                        </div>
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

export default Cart;