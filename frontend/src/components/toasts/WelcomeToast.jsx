import { useNavigate } from 'react-router-dom';
import { HiX, HiShoppingCart, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast'; // ADD THIS IMPORT!

const WelcomeToast = ({ t, user }) => {
    const navigate = useNavigate();

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
        if (hour < 18) return { text: 'Good afternoon', emoji: '🌤️' };
        return { text: 'Good evening', emoji: '🌙' };
    };

    const greeting = getGreeting();
    const userName = user?.first_name || user?.username || 'there';

    return (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
            {/* Gradient sidebar */}
            <div className="w-2 bg-gradient-to-b from-primary-500 to-primary-700"></div>

            {/* Main content */}
            <div className="flex-1 p-4">
                <div className="flex items-start">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                            {user?.is_new_user ? (
                                <span className="text-2xl">🎉</span>
                            ) : (
                                <span className="text-white font-bold text-lg">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Message content */}
                    <div className="ml-4 flex-1">
                        <p className="text-lg font-semibold text-secondary-900">
                            {greeting.text}, {userName}! {greeting.emoji}
                        </p>
                        <p className="mt-1 text-sm text-secondary-500">
                            {user?.is_new_user
                                ? 'Welcome to NEXSHOP! 🛍️'
                                : user?.last_login
                                    ? `Last seen: ${new Date(user.last_login).toLocaleDateString()}`
                                    : 'Welcome back to NEXSHOP!'
                            }
                        </p>

                        {/* Stats if available */}
                        {user?.stats && (
                            <div className="mt-3 flex gap-4 text-xs text-secondary-600">
                                {user.stats.cart_items > 0 && (
                                    <span className="flex items-center gap-1">
                                        <HiShoppingCart className="w-3 h-3" />
                                        {user.stats.cart_items} in cart
                                    </span>
                                )}
                                {user.stats.wishlist_items > 0 && (
                                    <span className="flex items-center gap-1">
                                        ❤️ {user.stats.wishlist_items} saved
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => {
                                    navigate('/products');
                                    toast.dismiss(t.id);
                                }}
                                className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
                            >
                                Browse Products
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/profile'); // Changed from /account to /profile based on your routes
                                    toast.dismiss(t.id);
                                }}
                                className="text-xs bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full hover:bg-secondary-200 transition-colors"
                            >
                                <HiUser className="inline w-3 h-3 mr-1" />
                                My Profile
                            </button>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-shrink-0 ml-4 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                        <HiX className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeToast;