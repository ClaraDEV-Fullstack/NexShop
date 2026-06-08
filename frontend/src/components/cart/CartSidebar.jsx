import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiX, HiTrash, HiMinus, HiPlus, HiShoppingBag } from 'react-icons/hi';
import {
    selectCartItems,
    selectCartTotal,
    closeCart,
    removeFromCart,
    updateQuantity,
} from '../../store/cartSlice';
import { getImageUrl, formatPrice } from '../../utils/helpers';

const CartSidebar = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector((state) => state.cart.isOpen);
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => dispatch(closeCart())}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-secondary-900">
                        Shopping Cart ({cartItems.length})
                    </h2>
                    <button
                        onClick={() => dispatch(closeCart())}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <HiShoppingBag className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                            <p className="text-secondary-500">Your cart is empty</p>
                            <Link
                                to="/products"
                                onClick={() => dispatch(closeCart())}
                                className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-secondary-50 p-3 rounded-lg">
                                    {/* Image */}
                                    <Link
                                        to={`/products/${item.slug}`}
                                        onClick={() => dispatch(closeCart())}
                                        className="w-20 h-20 flex-shrink-0"
                                    >
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/products/${item.slug}`}
                                            onClick={() => dispatch(closeCart())}
                                            className="font-medium text-secondary-900 hover:text-primary-600 line-clamp-2 text-sm"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-primary-600 font-bold mt-1">{formatPrice(item.price)}</p>

                                        {/* Quantity */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-secondary-300 rounded">
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                                    className="p-1 hover:bg-secondary-100"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <HiMinus className="w-3 h-3" />
                                                </button>
                                                <span className="px-2 text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                                    className="p-1 hover:bg-secondary-100"
                                                >
                                                    <HiPlus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => dispatch(removeFromCart(item.id))}
                                                className="text-red-500 hover:text-red-600 p-1"
                                            >
                                                <HiTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Subtotal</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <p className="text-sm text-secondary-500">
                            Shipping and taxes calculated at checkout
                        </p>
                        <Link
                            to="/checkout"
                            onClick={() => dispatch(closeCart())}
                            className="btn-primary w-full text-center block"
                        >
                            Proceed to Checkout
                        </Link>
                        <Link
                            to="/cart"
                            onClick={() => dispatch(closeCart())}
                            className="btn-secondary w-full text-center block"
                        >
                            View Cart
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;