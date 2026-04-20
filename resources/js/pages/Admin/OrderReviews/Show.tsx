import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Star, Pencil } from 'lucide-react';
import { cardClass } from '@/utils/formStyles';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order Reviews', href: '/admin/order-reviews' },
    { title: 'View', href: '#' },
];

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function Show({ review }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Review" />
            <div className="p-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review #{review.id}</h1>
                    <Link href={`/admin/order-reviews/${review.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                </div>

                <div className={cardClass}>
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm text-gray-500">Customer</dt>
                            <dd className="font-semibold">{review.customer?.first_name} {review.customer?.last_name}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm text-gray-500">Order</dt>
                            <dd className="font-mono text-blue-600">{review.order?.order_number}</dd>
                        </div>
                        <div className="py-3 flex justify-between items-center">
                            <dt className="text-sm text-gray-500">Rating</dt>
                            <dd><Stars rating={review.rating} /></dd>
                        </div>
                        <div className="py-3 flex justify-between items-center">
                            <dt className="text-sm text-gray-500">Status</dt>
                            <dd><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[review.status]}`}>
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </span></dd>
                        </div>
                        {review.review && (
                            <div className="py-3">
                                <dt className="text-sm text-gray-500 mb-1">Review</dt>
                                <dd className="text-gray-700 dark:text-gray-300">{review.review}</dd>
                            </div>
                        )}
                        {review.admin_reply && (
                            <div className="py-3">
                                <dt className="text-sm text-gray-500 mb-1">Admin Reply</dt>
                                <dd className="text-gray-700 dark:text-gray-300">{review.admin_reply}</dd>
                            </div>
                        )}
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm text-gray-500">Date</dt>
                            <dd className="text-sm">{new Date(review.created_at).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-4">
                    <Link href="/admin/order-reviews" className="text-sm text-blue-600 hover:underline">← Back to Reviews</Link>
                </div>
            </div>
        </AppLayout>
    );
}
