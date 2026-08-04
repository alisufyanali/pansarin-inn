import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Star, Clock, CheckCircle, XCircle, BarChart2,
    ThumbsUp, ThumbsDown, Trash2, Eye,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Site Reviews', href: '/admin/site-reviews' },
];

interface SiteReview {
    id: number;
    reviewer_name: string;
    reviewer_email: string;
    order_number: string;
    rating: number;
    comment: string;
    image: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avg_rating: number;
}

const STATUS_COLORS: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
    rejected: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
};

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

function StatusAction({ review, onDone }: { review: SiteReview; onDone: () => void }) {
    const [loading, setLoading] = useState(false);

    const updateStatus = (status: 'approved' | 'rejected') => {
        setLoading(true);
        router.patch(
            `/admin/site-reviews/${review.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => { toast.success(`Review ${status}.`); onDone(); },
                onError:   () => toast.error('Failed to update status.'),
                onFinish:  () => setLoading(false),
            },
        );
    };

    const deleteReview = () => {
        if (! confirm('Delete this review permanently?')) return;
        setLoading(true);
        router.delete(`/admin/site-reviews/${review.id}`, {
            onSuccess: () => { toast.success('Review deleted.'); onDone(); },
            onError:   () => toast.error('Failed to delete.'),
            onFinish:  () => setLoading(false),
        });
    };

    return (
        <div className="flex items-center gap-1">
            {review.status !== 'approved' && (
                <button
                    title="Approve"
                    disabled={loading}
                    onClick={() => updateStatus('approved')}
                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                >
                    <ThumbsUp className="w-4 h-4" />
                </button>
            )}
            {review.status !== 'rejected' && (
                <button
                    title="Reject"
                    disabled={loading}
                    onClick={() => updateStatus('rejected')}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                    <ThumbsDown className="w-4 h-4" />
                </button>
            )}
            <button
                title="Delete"
                disabled={loading}
                onClick={deleteReview}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function Index({
    stats,
    flash,
}: {
    stats: Stats;
    flash?: { success?: string; error?: string };
}) {
    const [tableKey, setTableKey] = useState(0);
    const refresh = () => setTableKey((k) => k + 1);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Reviewer',
            selector: (row: SiteReview) => row.reviewer_name,
            sortable: true,
            cell: (row: SiteReview) => (
                <div className="flex flex-col py-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {row.reviewer_name}
                    </span>
                    <span className="text-xs text-gray-500">{row.reviewer_email}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Order',
            selector: (row: SiteReview) => row.order_number,
            cell: (row: SiteReview) => (
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm">
                    {row.order_number}
                </span>
            ),
        },
        {
            name: 'Rating',
            selector: (row: SiteReview) => row.rating,
            sortable: true,
            cell: (row: SiteReview) => <Stars rating={row.rating} />,
            width: '130px',
        },
        {
            name: 'Comment',
            selector: (row: SiteReview) => row.comment,
            cell: (row: SiteReview) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {row.comment}
                </span>
            ),
            grow: 2,
        },
        {
            name: 'Image',
            cell: (row: SiteReview) =>
                row.image ? (
                    <a href={row.image} target="_blank" rel="noreferrer">
                        <img
                            src={row.image}
                            alt="review"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                    </a>
                ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                ),
            width: '80px',
        },
        {
            name: 'Status',
            selector: (row: SiteReview) => row.status,
            sortable: true,
            cell: (row: SiteReview) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status]}`}
                >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
            width: '110px',
        },
        CommonColumns.createdAt(true),
        {
            name: 'Actions',
            cell: (row: SiteReview) => <StatusAction review={row} onDone={refresh} />,
            width: '130px',
            ignoreRowClick: true,
        },
    ];

    const csvHeaders = [
        { label: 'ID',             key: 'id' },
        { label: 'Reviewer Name',  key: 'reviewer_name' },
        { label: 'Email',          key: 'reviewer_email' },
        { label: 'Order Number',   key: 'order_number' },
        { label: 'Rating',         key: 'rating' },
        { label: 'Comment',        key: 'comment' },
        { label: 'Status',         key: 'status' },
        { label: 'Submitted',      key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Site Reviews" />
            <div className="flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Customer Reviews
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Moderate site-wide customer testimonials
                        </p>
                    </div>
                    {stats.pending > 0 && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl text-sm font-semibold">
                            <Clock className="w-4 h-4" />
                            {stats.pending} pending review{stats.pending !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Total"      value={stats.total}      color="blue"   icon={Star} />
                    <StatCard title="Pending"    value={stats.pending}    color="amber"  icon={Clock} />
                    <StatCard title="Approved"   value={stats.approved}   color="emerald" icon={CheckCircle} />
                    <StatCard title="Rejected"   value={stats.rejected}   color="red"    icon={XCircle} />
                    <StatCard title="Avg Rating" value={`${stats.avg_rating} ★`} color="purple" icon={BarChart2} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        key={tableKey}
                        fetchUrl="/admin/site-reviews-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['reviewer_name', 'reviewer_email', 'order_number', 'comment', 'status']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
