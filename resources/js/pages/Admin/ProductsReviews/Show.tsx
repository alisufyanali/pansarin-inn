import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, Mail, MessageSquare, Star, User, Calendar } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader from '@/components/PageHeader';

interface Review {
    id: number;
    customer_name: string;
    customer_email: string;
    order_number: string;
    product: { name: string };
    rating: number;
    comment: string;
    is_verified: boolean;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export default function Show({ review }: { review: Review }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Reviews', href: '/admin/reviews' },
        { title: review.product.name, href: `/admin/reviews/${review.id}` },
        { title: 'Details', href: '#' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        }`}
                    />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rating}/5
                </span>
            </div>
        );
    };

    const actions = (
        <Link
            href={`/admin/reviews/${review.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
            <Edit2 className="h-4 w-4" />
            Edit Review
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review by ${review.customer_name}`} />

            <div className="p-3">
                <PageHeader
                    title={`Review by ${review.customer_name}`}
                    backUrl="/admin/reviews"
                    actions={actions}
                />

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Review Details */}
                    <SectionCard
                        title="Review Information"
                        icon={MessageSquare}
                    >
                        <div className="space-y-4">
                            <InfoRow
                                label="Customer Name"
                                value={review.customer_name}
                            />
                            <InfoRow
                                label="Customer Email"
                                value={review.customer_email}
                            />
                            <InfoRow
                                label="Order Number"
                                value={review.order_number}
                            />
                            <InfoRow
                                label="Product"
                                value={review.product.name}
                            />
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                    Rating
                                </label>
                                {renderStars(review.rating)}
                            </div>

                            {review.comment && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                        Comment
                                    </label>
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* Status Information */}
                    <SectionCard
                        title="Status Information"
                        icon={MessageSquare}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Verification Status
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        review.is_verified
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}
                                >
                                    {review.is_verified ? 'Verified' : 'Not Verified'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Publication Status
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        review.status
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                                >
                                    {review.status ? 'Published' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    {/* System Information */}
                    <SectionCard
                        title="System Information"
                        icon={Calendar}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow
                                label="Submitted On"
                                value={formatDate(review.created_at)}
                            />
                            <InfoRow
                                label="Last Updated"
                                value={formatDate(review.updated_at)}
                            />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}