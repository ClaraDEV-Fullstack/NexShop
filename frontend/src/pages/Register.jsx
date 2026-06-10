import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiShieldCheck, HiCheck, HiDeviceMobile, HiGlobe, HiLockOpen, HiUserAdd, HiArrowRight } from 'react-icons/hi';
import { registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import ResponsiveGoogleLogin from '../components/auth/ResponsiveGoogleLogin';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
    });

    // Show error toast
    useEffect(() => {
        if (error) {
            const errorMsg = typeof error === 'object'
                ? Object.values(error).flat().join(' ')
                : error;
            toast.error(errorMsg || 'Registration failed');
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match');
            return;
        }

        const result = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created! Please login.');
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center px-4 py-12 overflow-x-hidden">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Content */}
                <div className="hidden lg:block">
                    <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl p-10 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <HiUserAdd className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">Join Our Community</h1>
                        </div>

                        <p className="text-amber-100 mb-10 text-lg">
                            Create an account to unlock exclusive deals, track your orders, and enjoy a personalized shopping experience.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Secure Account</h3>
                                    <p className="text-amber-100">Your data is protected with industry-standard encryption</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiDeviceMobile className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Shop Anywhere</h3>
                                    <p className="text-amber-100">Access your account from any device, anytime</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <HiGlobe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Global Access</h3>
                                    <p className="text-amber-100">Enjoy worldwide shipping and exclusive deals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg">
                                <HiUser className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join us and start shopping today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
                        <div className="p-8">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="mb-6">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="At least 8 characters"
                                        required
                                        minLength={8}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-6">
                                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password2"
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="mb-6">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input type="checkbox" required className="mt-1 rounded text-amber-500 focus:ring-amber-500" />
                                    <span className="text-sm text-gray-600">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-amber-600 hover:text-amber-700 font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <hr className="flex-1 border-gray-300" />
                        <span className="px-4 text-gray-500 text-sm">or sign up faster with</span>
                        <hr className="flex-1 border-gray-300" />
                    </div>

                    {/* Google Signup Button */}
                    <ResponsiveGoogleLogin
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
                                toast.error('Google Sign-Up failed. Please try again.');
                            }}
                            useOneTap={false}
                            logo_alignment="center"
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                        />

                    {/* Login Link */}
                    <p className="text-center mt-6 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
                            Sign in
                            <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </p>

                    {/* Security Note */}
                    <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
                        <HiShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                        Your data is secure and encrypted
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
