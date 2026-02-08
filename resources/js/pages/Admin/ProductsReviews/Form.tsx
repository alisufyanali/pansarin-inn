import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Send,
    ShieldCheck,
    Star,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface ReviewFormProps {
    product: {
        id: number;
        name: string;
        image?: string;
    };
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    existingReview?: any;
    userOrders?: Array<{
        id: number;
        order_number: string;
        created_at: string;
    }>;
    onClose?: () => void;
}

export default function ReviewForm({
    product,
    auth,
    existingReview,
    userOrders = [],
    onClose,
}: ReviewFormProps) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const isLoggedIn = !!auth?.user;

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: product.id,
        customer_name: auth?.user?.name || '',
        customer_email: auth?.user?.email || '',
        order_number: '',
        rating: 5,
        comment: '',
    });

    const handleSubmit = () => {
        post('/reviews', {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                setTimeout(() => {
                    reset();
                    onClose?.();
                }, 2000);
            },
        });
    };

    const renderStars = () => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setData('rating', star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            size={32}
                            className={
                                star <= (hoveredRating || data.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            }
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingLabel = (rating: number) => {
        const labels = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent',
        };
        return labels[rating as keyof typeof labels];
    };

    // Success State
    if (submitted) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle
                            className="text-green-600 dark:text-green-400"
                            size={32}
                        />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Review Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Thank you for your feedback. Your review is pending
                        admin approval.
                    </p>
                </div>
            </div>
        );
    }

    // Already Reviewed
    if (existingReview) {
        return (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                    <AlertCircle
                        className="mt-1 text-blue-600 dark:text-blue-400"
                        size={24}
                    />
                    <div>
                        <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-100">
                            You've Already Reviewed This Product
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            You submitted a review on{' '}
                            {new Date(
                                existingReview.created_at,
                            ).toLocaleDateString()}
                            . You can edit or delete your review from your
                            account dashboard.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">
                                Write a Review
                            </h2>
                            <p className="text-blue-100">{product.name}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 transition hover:bg-white/20"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6 p-8">
                {/* Rating Section */}
                <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Rate this product *
                    </label>
                    {renderStars()}
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getRatingLabel(data.rating)}
                    </p>
                </div>

                {/* Guest Fields */}
                {!isLoggedIn && (
                    <>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData('customer_name', e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="John Doe"
                            />
                            {errors.customer_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.customer_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={data.customer_email}
                                onChange={(e) =>
                                    setData('customer_email', e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="john@example.com"
                            />
                            {errors.customer_email && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.customer_email}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Order Number (For Verification) */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Order Number (Optional - For Verified Badge)
                    </label>

                    {isLoggedIn && userOrders.length > 0 ? (
                        <select
                            value={data.order_number}
                            onChange={(e) =>
                                setData('order_number', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Select an order (optional)</option>
                            {userOrders.map((order) => (
                                <option
                                    key={order.id}
                                    value={order.order_number}
                                >
                                    {order.order_number} -{' '}
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={data.order_number}
                            onChange={(e) =>
                                setData('order_number', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="e.g., ORD-12345"
                        />
                    )}

                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <ShieldCheck
                            className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                            size={16}
                        />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Provide your order number to get a "Verified
                            Purchase" badge on your review
                        </p>
                    </div>

                    {errors.order_number && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.order_number}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Your Review *
                    </label>
                    <textarea
                        value={data.comment}
                        onChange={(e) => setData('comment', e.target.value)}
                        rows={5}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Share your experience with this product... (minimum 10 characters)"
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {data.comment.length} / 1000 characters
                        </p>
                        {errors.comment && (
                            <p className="text-xs text-red-500">
                                {errors.comment}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={20} />
                        {processing ? 'Submitting...' : 'Submit Review'}
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 px-6 py-4 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Your review will be visible after admin approval
                </p>
            </div>
        </div>
    );
}
