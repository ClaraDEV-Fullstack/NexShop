import { useState, useEffect, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineTrash,
    HiOutlineShoppingBag,
    HiOutlineTruck,
    HiOutlineCreditCard,
    HiOutlineSpeakerphone,
    HiOutlineArrowLeft
} from 'react-icons/hi';
import { notificationsAPI } from '../../api/api';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const NotificationItem = memo(({ notification, onMarkAsRead, onDelete }) => {
    const getTypeIcon = (type) => {
        const icons = {
            order: HiOutlineShoppingBag,
            payment: HiOutlineCreditCard,
            shipping: HiOutlineTruck,
            promo: HiOutlineSpeakerphone,
            system: HiOutlineBell,
        };
        return icons[type] || HiOutlineBell;
    };

    const getTypeColor = (type) => {
        const colors = {
            order: 'text-primary-500 bg-primary-100 dark:bg-primary-900/30',
            payment: 'text-green-500 bg-green-100 dark:bg-green-900/30',
            shipping: 'text-primary-500 bg-primary-100 dark:bg-primary-900/30',
            promo: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
            system: 'text-secondary-500 bg-secondary-100 dark:bg-secondary-700',
        };
        return colors[type] || colors.system;
    };

    const Icon = getTypeIcon(notification.type);

    return (
        <div
            className={`bg-white dark:bg-secondary-800 rounded-xl p-3 sm:p-4 border transition-all ${
                notification.is_read
                    ? 'border-secondary-100 dark:border-secondary-700'
                    : 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
            }`}
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-sm sm:text-base truncate ${notification.is_read ? 'text-secondary-700 dark:text-secondary-300' : 'text-secondary-900 dark:text-white'}`}>
                                {notification.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-2">
                                {notification.time_ago || new Date(notification.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            {!notification.is_read && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1.5 sm:p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                                    title="Mark as read"
                                >
                                    <HiOutlineCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(notification.id)}
                                className="p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <HiOutlineTrash className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            </button>
                        </div>
                    </div>

                    {/* Link Button */}
                    {notification.link && (
                        <Link
                            to={notification.link}
                            className="inline-flex items-center gap-1 mt-2 text-xs sm:text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                            View Details →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
});

const DashboardNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await notificationsAPI.getAll();
            setNotifications(response.data.results || response.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAllRead = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            await notificationsAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            toast.error('Failed to mark notifications as read');
        } finally {
            setIsProcessing(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            console.error('Failed to mark as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationsAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const clearAll = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            await notificationsAPI.clearAll();
            setNotifications([]);
            toast.success('All notifications cleared');
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (error) {
            toast.error('Failed to clear notifications');
        } finally {
            setIsProcessing(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-secondary-500 hover:text-primary-500 mb-2 text-sm"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white">Notifications</h1>
                        <p className="text-sm sm:text-base text-secondary-500 dark:text-secondary-400">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                disabled={isProcessing}
                                className={`flex items-center gap-2 px-3 py-2 sm:px-4 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <HiOutlineCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Mark all read</span>
                                <span className="sm:hidden">Read all</span>
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                disabled={isProcessing}
                                className={`flex items-center gap-2 px-3 py-2 sm:px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <HiOutlineTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Clear all</span>
                                <span className="sm:hidden">Clear</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2 sm:space-y-3">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-3 sm:p-4 border border-secondary-100 dark:border-secondary-700">
                                <div className="flex gap-3 sm:gap-4">
                                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-secondary-800 rounded-xl p-8 sm:p-12 text-center border border-secondary-100 dark:border-secondary-700">
                            <HiOutlineBell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
                            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                                No notifications
                            </h3>
                            <p className="text-sm sm:text-base text-secondary-500 dark:text-secondary-400">
                                You're all caught up! We'll notify you when something happens.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardNotifications;