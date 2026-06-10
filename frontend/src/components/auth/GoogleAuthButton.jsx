import ResponsiveGoogleLogin from './ResponsiveGoogleLogin';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice';
import api from '../../api/api';
import toast from 'react-hot-toast';

const GoogleAuthButton = ({ mode = 'login' }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoogleSuccess = async (credentialResponse) => {
        const loadingToast = toast.loading(
            mode === 'login' ? 'Signing you in with Google...' : 'Creating your account...'
        );

        try {
            // Send Google credential to backend
            const response = await api.post('/accounts/google/auth/', {
                credential: credentialResponse.credential
            });

            toast.dismiss(loadingToast);

            if (response.data.success) {
                const { user, tokens, is_new_user } = response.data;

                // Save to Redux store
                dispatch(setCredentials({
                    user,
                    token: tokens.access,
                    refreshToken: tokens.refresh,
                }));

                // Save tokens to localStorage
                localStorage.setItem('accessToken', tokens.access);
                localStorage.setItem('refreshToken', tokens.refresh);

                // Show success message
                toast.success(
                    is_new_user
                        ? `Welcome to NEXSHOP, ${user.first_name || user.username}!`
                        : `Welcome back, ${user.first_name || user.username}!`,
                    { duration: 4000 }
                );

                // Navigate to home or intended page
                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/';
                    navigate(from, { replace: true });
                }, 1000);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Google auth error:', error);

            const errorMessage = error.response?.data?.error || 'Google authentication failed';
            toast.error(errorMessage);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Sign-In was cancelled or failed');
    };

    return (
        <ResponsiveGoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            shape="rectangular"
        />
    );
};

export default GoogleAuthButton;