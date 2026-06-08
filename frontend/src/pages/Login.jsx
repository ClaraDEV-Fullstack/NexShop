import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUserCircle, HiShieldCheck, HiDeviceMobile, HiFingerPrint, HiKey, HiArrowRight } from 'react-icons/hi';
import { loginUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import WelcomeToast from '../components/toasts/WelcomeToast';
import { toastConfig } from '../utils/toastConfig';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toastConfig.error(typeof error === 'string' ? error : 'Login failed. Please check your credentials.');
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create a loading toast that we can dismiss later
        const loadingToastId = toast.loading('Signing you in...');

        try {
            const result = await dispatch(loginUser(formData));

            // Dismiss the loading toast
            toast.dismiss(loadingToastId);

            if (loginUser.fulfilled.match(result)) {
                // Get user data from the result
                const userData = result.payload.user;

                // Show custom welcome toast
                toast.custom((t) => (
                    <WelcomeToast
                        t={t}
                        user={userData}
                    />
                ), {
                    duration: 6000,
                    position: 'top-center',
                });

                // Navigate after a short delay
                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/';
                    navigate(from, { replace: true });
                }, 1500);
            }
        } catch (err) {
            // Dismiss loading toast on error
            toast.dismiss(loadingToastId);
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Content */}
                <div className="hidden lg:block">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <HiUserCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">Welcome Back</h1>
                        </div>

                        <p className="text-primary-100 mb-10 text-lg">
                            Sign in to access your personalized shopping experience, track orders, and enjoy exclusive benefits.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Secure Login</h3>
                                    <p className="text-primary-100">Your data is protected with industry-standard encryption</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiDeviceMobile className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Any Device</h3>
                                    <p className="text-primary-100">Access your account from anywhere, on any device</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiKey className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Quick Access</h3>
                                    <p className="text-primary-100">Save time with one-click login options</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-500 rounded-full shadow-lg">
                                <HiUserCircle className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                        <p className="text-gray-600">Enter your credentials to access your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="p-8">
                            {/* Email */}
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="opacity-0">Sign In</span>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">or continue with</span>
                                </div>
                            </div>

                            {/* Google Login */}
                            <div className="w-full flex justify-center">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        const loadingToastId = toast.loading('Signing you in with Google...');

                                        try {
                                            const response = await fetch(`${API_URL}/accounts/google/auth/`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ credential: credentialResponse.credential }),
                                            });

                                            const data = await response.json();
                                            toast.dismiss(loadingToastId);

                                            if (data.tokens && data.user) {
                                                // Save tokens
                                                localStorage.setItem('accessToken', data.tokens.access);
                                                localStorage.setItem('refreshToken', data.tokens.refresh);

                                                // Update Redux state
                                                dispatch({
                                                    type: 'auth/login/fulfilled',
                                                    payload: data.user
                                                });

                                                // Show success
                                                toast.success(data.is_new_user ? 'Account created!' : 'Welcome back!');

                                                // Redirect
                                                setTimeout(() => {
                                                    navigate('/');
                                                }, 1500);

                                            } else {
                                                toast.error(data.error || 'Google sign-in failed. Please try again.');
                                            }
                                        } catch (err) {
                                            toast.dismiss(loadingToastId);
                                            console.error('Google login error:', err);
                                            toast.error('Something went wrong. Please try again.');
                                        }
                                    }}
                                    onError={() => {
                                        toast.error('Google Sign-In failed. Please try again.');
                                    }}
                                    useOneTap={false}
                                    logo_alignment="center"
                                    theme="outline"
                                    size="large"
                                    text="continue_with"
                                    shape="rectangular"
                                    width={400}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-8 text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium transition-colors inline-flex items-center gap-1">
                            Sign up
                            <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </p>

                    {/* Security Note */}
                    <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                        <HiShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                        Your login is secure and encrypted
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
