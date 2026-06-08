import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import { loadUser } from './store/authSlice';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import CartSidebar from './components/cart/CartSidebar';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Contact from './pages/Contact';
// Dashboard Pages (Now with Navbar)
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import DashboardOrders from './pages/Dashboard/DashboardOrders';
import DashboardWishlist from './pages/Dashboard/DashboardWishlist';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
import DashboardNotifications from './pages/Dashboard/DashboardNotifications';

// Error Pages
import NotFound from './pages/NotFound';
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Returns from "./pages/Returns";


const AppContent = () => {
    useEffect(() => {
        store.dispatch(loadUser());
    }, []);

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-white dark:bg-secondary-900 transition-colors duration-300">
                <Navbar />
                <CartSidebar />

                <main className="flex-grow">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
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
