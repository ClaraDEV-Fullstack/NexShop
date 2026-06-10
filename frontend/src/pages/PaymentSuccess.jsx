import { useEffect, useState } from 'react';
import { formatPrice } from '../utils/helpers';
import { Link, useLocation } from 'react-router-dom';
import { HiCheckCircle, HiShoppingBag, HiHome, HiMail } from 'react-icons/hi';
import confetti from 'canvas-confetti';
import { ordersAPI } from '../api/api';

const PaymentSuccess = () => {
    const location = useLocation();
    const [showContent, setShowContent] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const searchParams = new URLSearchParams(location.search);
    const orderData = location.state || {};
    const orderId = searchParams.get('order_id') || orderData.orderId || orderData.order_id || '---';
    const transactionId =
        searchParams.get('transaction_id') ||
        orderData.transactionId ||
        orderData.transaction_id ||
        'TXN-' + Date.now();
    const amount = orderDetails?.total || orderData.amount || orderData.total || '0.00';

    useEffect(() => {
        const orderIdParam = searchParams.get('order_id');
        if (orderIdParam && orderIdParam !== '---') {
            ordersAPI.getById(orderIdParam)
                .then((response) => setOrderDetails(response.data))
                .catch(() => {});
        }
    }, [location.search]);

    useEffect(() => {
        const triggerConfetti = () => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
            });

            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22c55e', '#3b82f6', '#f59e0b']
                });
            }, 200);

            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ec4899', '#8b5cf6', '#22c55e']
                });
            }, 400);

            setTimeout(() => {
                confetti({
                    particleCount: 30,
                    spread: 100,
                    origin: { y: 0.3, x: 0.5 },
                    colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
                });
            }, 600);
        };

        triggerConfetti();
        setTimeout(() => setShowContent(true), 300);

        const interval = setInterval(() => {
            confetti({
                particleCount: 20,
                spread: 60,
                origin: { y: Math.random() * 0.5 + 0.3, x: Math.random() },
                colors: ['#22c55e', '#3b82f6']
            });
        }, 2000);

        setTimeout(() => clearInterval(interval), 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-secondary-900">
            <div className={`max-w-lg w-full text-center transition-all duration-700 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-bounce">
                            <HiCheckCircle className="w-16 h-16 text-white" />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-secondary-900 dark:text-white mb-4">
                    Payment Successful! 🎉
                </h1>
                <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8">
                    Thank you for your purchase. Your order is being processed.
                </p>

                <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 mb-8 border border-secondary-100 dark:border-secondary-700">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-secondary-100 dark:border-secondary-700">
                            <span className="text-secondary-500 dark:text-secondary-400">Order Number</span>
                            <span className="font-bold text-secondary-900 dark:text-white text-lg">#{orderId}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-secondary-100 dark:border-secondary-700">
                            <span className="text-secondary-500 dark:text-secondary-400">Amount Paid</span>
                            <span className="font-bold text-green-600 dark:text-green-400 text-2xl">
                                {formatPrice(amount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-secondary-500 dark:text-secondary-400">Transaction ID</span>
                            <span className="font-mono text-sm text-secondary-700 dark:text-secondary-300">{transactionId}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-secondary-600 dark:text-secondary-400 mb-8 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl">
                    <HiMail className="w-5 h-5 text-primary-500" />
                    <span>A confirmation email has been sent to your inbox.</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to={`/orders/${orderId}`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
                    >
                        <HiShoppingBag className="w-5 h-5" />
                        View Order Details
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                    >
                        <HiHome className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>

                <p className="mt-8 text-secondary-400 dark:text-secondary-500 text-sm">
                    🚀 Your order is on its way to being awesome!
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
