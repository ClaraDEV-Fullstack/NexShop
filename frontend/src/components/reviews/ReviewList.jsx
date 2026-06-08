import { useState } from 'react';
import { useSelector } from 'react-redux';
import { HiPencil, HiTrash, HiCheckBadge } from 'react-icons/hi2';
import StarRating from '../common/StarRating';
import ReviewForm from './ReviewForm';
import { reviewsAPI } from '../../api/api';
import toast from 'react-hot-toast';

const ReviewList = ({ reviews, productId, onReviewChange }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const handleUpdateReview = async (reviewData) => {
        try {
            await reviewsAPI.update(editingId, reviewData);
            toast.success('Review updated successfully');
            setEditingId(null);
            onReviewChange();
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to update review';
            toast.error(msg);
            throw error;
        }
    };

    const handleDeleteReview = async (reviewId) => {
        setDeletingId(reviewId);
        try {
            await reviewsAPI.delete(reviewId);
            toast.success('Review deleted successfully');
            onReviewChange();
        } catch (error) {
            toast.error('Failed to delete review');
        } finally {
            setDeletingId(null);
        }
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    // Generate consistent color based on name
    const getAvatarColor = (name) => {
        const colors = [
            'bg-primary-500',
            'bg-green-500',
            'bg-primary-500',
            'bg-pink-500',
            'bg-orange-500',
            'bg-teal-500',
            'bg-primary-500',
            'bg-red-500',
            'bg-cyan-500',
            'bg-amber-500',
        ];

        if (!name) return colors[0];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-3 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                    No reviews yet. Be the first to review this product!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {reviews.map((review) => {
                // Check ownership by user ID or email
                const isOwner = isAuthenticated && (
                    user?.id === review.user ||
                    user?.email === review.user_email
                );
                const isEditing = editingId === review.id;

                if (isEditing) {
                    return (
                        <ReviewForm
                            key={review.id}
                            productId={productId}
                            existingReview={review}
                            onSubmit={handleUpdateReview}
                            onCancel={() => setEditingId(null)}
                        />
                    );
                }

                return (
                    <div
                        key={review.id}
                        className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-4 md:p-5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {review.user_avatar ? (
                                        <img
                                            src={review.user_avatar}
                                            alt={review.user_name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-secondary-700"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-secondary-700 ${getAvatarColor(review.user_name)}`}
                                        style={{ display: review.user_avatar ? 'none' : 'flex' }}
                                    >
                                        {getInitials(review.user_name)}
                                    </div>

                                    {/* Verified badge */}
                                    {review.is_verified_purchase && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-secondary-700">
                                            <HiCheckBadge className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-secondary-900 dark:text-white text-sm truncate max-w-[150px] sm:max-w-none">
                            {review.user_name || 'Anonymous'}
                        </span>
                                        {review.is_verified_purchase && (
                                            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                <HiCheckBadge className="w-2.5 h-2.5" />
                                Verified
                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StarRating rating={review.rating} readonly size="sm" />
                                        <span className="text-[11px] text-secondary-400 dark:text-secondary-500 flex-shrink-0">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions for owner */}
                            {isOwner && (
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <button
                                        onClick={() => setEditingId(review.id)}
                                        className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <HiPencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        disabled={deletingId === review.id}
                                        className="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deletingId === review.id ? (
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <HiTrash className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        {review.title && (
                            <h4 className="font-medium text-secondary-900 dark:text-white text-sm mb-1.5 break-words">
                                {review.title}
                            </h4>
                        )}

                        {/* Comment */}
                        <div className="overflow-hidden">
                            <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere word-break-break-word">
                                {review.comment}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewList;