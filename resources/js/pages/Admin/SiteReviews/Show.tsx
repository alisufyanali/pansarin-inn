import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Home, Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SiteReview {
    id: number;
    order_id: number;
    order_number: string;
    reviewer_name: string;
    reviewer_email: string;
    rating: number;
    comment: string;
    image: string | null;
    status: 'pending' | 'approved' | 'rejected';
    show_on_homepage: boolean;
    admin_note: string | null;
    created_at: string;
}

const STATUS_COLORS: Record<SiteReview['status'], string> = {
    pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Show({
    review,
    flash,
}: {
    review: SiteReview;
    flash?: { success?: string; error?: string };
}) {
    const [note, setNote] = useState(review.admin_note ?? '');
    const [loading, setLoading] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer Reviews', href: '/admin/site-reviews' },
        { title: `#${review.id}`, href: `/admin/site-reviews/${review.id}` },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // The model stores a path relative to public/storage.
    const imageUrl = review.image ? `/storage/${review.image}` : null;

    const updateStatus = (status: SiteReview['status']) => {
        setLoading(true);
        router.patch(
            `/admin/site-reviews/${review.id}/status`,
            { status, admin_note: note || null },
            { preserveScroll: true, onFinish: () => setLoading(false) },
        );
    };

    const toggleHomepage = () => {
        setLoading(true);
        router.patch(
            `/admin/site-reviews/${review.id}/toggle-homepage`,
            { show_on_homepage: ! review.show_on_homepage },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(review.show_on_homepage ? 'Removed from homepage.' : 'Shown on homepage.'),
                onError:   (errors) => toast.error(errors.show_on_homepage ?? 'Failed to update.'),
                onFinish:  () => setLoading(false),
            },
        );
    };

    const deleteReview = () => {
        if (! confirm('Delete this review permanently?')) return;
        setLoading(true);
        router.delete(`/admin/site-reviews/${review.id}`, { onFinish: () => setLoading(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer Review #${review.id}`} />
            <div className="flex flex-col gap-6 max-w-4xl">

                <Link
                    href="/admin/site-reviews"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Customer Reviews
                </Link>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{review.reviewer_name}</h1>
                            <p className="text-sm text-gray-500">{review.reviewer_email || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {review.show_on_homepage && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <Home className="w-3 h-3" /> On homepage
                                </span>
                            )}
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[review.status]}`}>
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Meta */}
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Order</dt>
                            <dd className="font-mono text-blue-600 dark:text-blue-400">{review.order_number}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Rating</dt>
                            <dd className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Submitted</dt>
                            <dd className="text-gray-900 dark:text-gray-100">{new Date(review.created_at).toLocaleString()}</dd>
                        </div>
                    </dl>

                    {/* Comment */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Review</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{review.comment}</p>
                    </div>

                    {imageUrl && (
                        <a href={imageUrl} target="_blank" rel="noreferrer" className="w-fit">
                            <img src={imageUrl} alt="Review" className="max-h-64 rounded-xl border border-gray-200 object-contain" />
                        </a>
                    )}

                    {/* Admin note (saved together with a status change) */}
                    <div>
                        <label htmlFor="admin_note" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Admin note <span className="font-normal text-gray-400">(internal, saved with Approve/Reject)</span>
                        </label>
                        <textarea
                            id="admin_note"
                            rows={3}
                            maxLength={1000}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {review.status !== 'approved' && (
                            <button
                                disabled={loading}
                                onClick={() => updateStatus('approved')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                <ThumbsUp className="w-4 h-4" /> Approve
                            </button>
                        )}
                        {review.status !== 'rejected' && (
                            <button
                                disabled={loading}
                                onClick={() => updateStatus('rejected')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                <ThumbsDown className="w-4 h-4" /> Reject
                            </button>
                        )}
                        {review.status === 'approved' && (
                            <button
                                disabled={loading}
                                onClick={toggleHomepage}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50"
                            >
                                <Home className="w-4 h-4" /> {review.show_on_homepage ? 'Remove from homepage' : 'Show on homepage'}
                            </button>
                        )}
                        <button
                            disabled={loading}
                            onClick={deleteReview}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
