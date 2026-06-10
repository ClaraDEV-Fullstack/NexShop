import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import { loadUser } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { useBackendWarmup } from './hooks/useBackendWarmup';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import CartSidebar from './components/cart/CartSidebar';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import PageLoader from './components/common/PageLoader';
import BackendStatusBanner from './components/common/BackendStatusBanner';
import GoogleAuthProvider from './components/auth/GoogleAuthProvider';

// Pages — lazy-loaded to shrink the initial bundle
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Payment = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Contact = lazy(() => import('./pages/Contact'));
const DashboardOverview = lazy(() => import('./pages/Dashboard/DashboardOverview'));
const DashboardOrders = lazy(() => import('./pages/Dashboard/DashboardOrders'));
const DashboardWishlist = lazy(() => import('./pages/Dashboard/DashboardWishlist'));
const DashboardSettings = lazy(() => import('./pages/Dashboard/DashboardSettings'));
const DashboardNotifications = lazy(() => import('./pages/Dashboard/DashboardNotifications'));
const NotFound = lazy(() => import('./pages/NotFound'));
const FAQ = lazy(() => import('./pages/FAQ'));
const About = lazy(() => import('./pages/About'));
const Returns = lazy(() => import('./pages/Returns'));


const AppContent = () => {
    const backendStatus = useBackendWarmup();

    useEffect(() => {
        store.dispatch(loadUser());
    }, []);

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <BackendStatusBanner status={backendStatus} />
            <div className="min-h-screen flex flex-col bg-white dark:bg-secondary-900 transition-colors duration-300">
                <Navbar />
                <CartSidebar />

                <main className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/:slug" element={<ProductDetail />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<GoogleAuthProvider><Login /></GoogleAuthProvider>} />
                            <Route path="/register" element={<GoogleAuthProvider><Register /></GoogleAuthProvider>} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/FAQ" element={<FAQ />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/returns" element={<Returns />} />

                            {/* Protected Routes */}
                            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                            <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />

                            {/* Dashboard Routes (with Navbar) */}
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
                            <Route path="/dashboard/orders" element={<ProtectedRoute><DashboardOrders /></ProtectedRoute>} />
                            <Route path="/dashboard/wishlist" element={<ProtectedRoute><DashboardWishlist /></ProtectedRoute>} />
                            <Route path="/dashboard/notifications" element={<ProtectedRoute><DashboardNotifications /></ProtectedRoute>} />
                            <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </main>

                <Footer />
                <ScrollToTopButton />

                {/* Toast Notifications */}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    containerStyle={{ top: 80 }}
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            maxWidth: '500px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        },
                        success: {
                            duration: 5000,
                            style: {
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            },
                            iconTheme: { primary: '#fff', secondary: '#10b981' },
                        },
                        error: {
                            duration: 5000,
                            style: {
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            },
                            iconTheme: { primary: '#fff', secondary: '#ef4444' },
                        },
                    }}
                />
            </div>
        </Router>
    );
};

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </Provider>
    );
}

export default App;
