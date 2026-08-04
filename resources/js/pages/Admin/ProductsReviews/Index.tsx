import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    BarChart2,
    CheckCircle,
    MessageSquare,
    Reply,
    ShieldAlert,
    ShieldCheck,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Reviews', href: '/admin/reviews' },
];

// ── Types ─────────────────────────────────────────────────────────

interface Review {
    id: number;
    customer_name: string;
    customer_email: string;
    product: { id: number; name: string; thumbnail: string | null } | null;
    title: string | null;
    rating: number;
    comment: string;
    is_verified: boolean;
    status: 'approved' | 'pending';
    helpful_count: number;
    admin_reply: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    approved: number;
    pending: number;
    verified: number;
}

// ── Stars helper ──────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={13}
                    className={i <= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                />
            ))}
        </div>
    );
}

// ── Reply modal ───────────────────────────────────────────────────

function ReplyModal({
    review,
    onClose,
    onSaved,
}: {
    review: Review;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [text, setText] = useState(review.admin_reply ?? '');
    const [loading, setLoading] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textRef.current?.focus();
    }, []);

    const save = () => {
        if (!text.trim()) return;
        setLoading(true);
        router.post(
            `/admin/reviews/${review.id}/reply`,
            { reply: text },
            {
                preserveScroll: true,
                onSuccess: () => { toast.success('Reply saved.'); onSaved(); onClose(); },
                onError: () => toast.error('Failed to save reply.'),
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">Reply to Review</h3>
                        <p className="text-sm text-gray-500">
                            {review.customer_name} — <Stars n={review.rating} />
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={18} />
                    </button>
                </div>
                <blockquote className="text-sm text-gray-600 dark:text-gray-400 border-l-4 border-gray-200 pl-3 italic line-clamp-3">
                    {review.comment}
                </blockquote>
                <textarea
                    ref={textRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Write your reply…"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                />
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={loading || !text.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50 transition"
                    >
                        {loading ? 'Saving…' : 'Save Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────

export default function Index({
    stats,
    flash,
}: {
    stats: Stats;
    flash?: { success?: string; error?: string };
}) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [replyTarget, setReplyTarget] = useState<Review | null>(null);
    const [tableKey, setTableKey] = useState(0);
    const refresh = () => { setTableKey((k) => k + 1); setSelectedIds([]); };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // ── Single-row actions ────────────────────────────────────────

    const setStatus = (id: number, status: 'approved' | 'pending') => {
        router.patch(
            `/admin/reviews/${id}/status`,
            { status },
            { preserveScroll: true, onSuccess: () => { toast.success(`Review ${status}.`); refresh(); } },
        );
    };

    const deleteOne = (id: number) => {
        if (!confirm('Delete this review permanently?')) return;
        router.delete(`/admin/reviews/${id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Review deleted.'); refresh(); },
        });
    };

    // ── Bulk actions ──────────────────────────────────────────────

    const bulkAction = (action: 'approve' | 'reject' | 'delete') => {
        if (!selectedIds.length) return;
        if (action === 'delete' && !confirm(`Delete ${selectedIds.length} review(s)?`)) return;
        router.post(
            '/admin/reviews/bulk-action',
            { action, ids: selectedIds },
            { preserveScroll: true, onSuccess: () => { toast.success('Done.'); refresh(); } },
        );
    };

    // ── Columns ───────────────────────────────────────────────────

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) =>
                        setSelectedIds(e.target.checked ? [] : []) // handled by row-level below
                    }
                />
            ),
            cell: (row: Review) => (
                <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) =>
                        setSelectedIds((prev) =>
                            e.target.checked
                                ? [...prev, row.id]
                                : prev.filter((id) => id !== row.id),
                        )
                    }
                />
            ),
            width: '48px',
            ignoreRowClick: true,
        },
        CommonColumns.id(),
        {
            name: 'Reviewer',
            selector: (row: Review) => row.customer_name,
            sortable: true,
            cell: (row: Review) => (
                <div className="flex flex-col py-1.5">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {row.customer_name}
                    </span>
                    <span className="text-xs text-gray-500">{row.customer_email}</span>
                    {row.product && (
                        <span className="text-xs text-blue-500 italic mt-0.5">{row.product.name}</span>
                    )}
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Rating',
            selector: (row: Review) => row.rating,
            sortable: true,
            cell: (row: Review) => <Stars n={row.rating} />,
            width: '110px',
        },
        {
            name: 'Comment',
            selector: (row: Review) => row.comment,
            cell: (row: Review) => (
                <div className="py-1.5 space-y-0.5">
                    {row.title && (
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                            {row.title}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{row.comment}</p>
                    {row.admin_reply && (
                        <p className="text-xs text-blue-500 italic line-clamp-1">
                            ↩ {row.admin_reply}
                        </p>
                    )}
                </div>
            ),
            grow: 2,
        },
        {
            name: 'Verified',
            selector: (row: Review) => row.is_verified,
            sortable: true,
            cell: (row: Review) =>
                row.is_verified ? (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <ShieldCheck size={12} /> Verified
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">Guest</span>
                ),
            width: '110px',
        },
        {
            name: 'Status',
            selector: (row: Review) => row.status,
            sortable: true,
            cell: (row: Review) => (
                <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                >
                    {row.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
            ),
            width: '100px',
        },
        CommonColumns.createdAt(true),
        {
            name: 'Actions',
            cell: (row: Review) => (
                <div className="flex items-center gap-1">
                    {row.status !== 'approved' ? (
                        <button
                            title="Approve"
                            onClick={() => setStatus(row.id, 'approved')}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
                        >
                            <ThumbsUp size={14} />
                        </button>
                    ) : (
                        <button
                            title="Reject"
                            onClick={() => setStatus(row.id, 'pending')}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                        >
                            <ThumbsDown size={14} />
                        </button>
                    )}
                    <button
                        title="Reply"
                        onClick={() => setReplyTarget(row)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                    >
                        <Reply size={14} />
                    </button>
                    <button
                        title="Delete"
                        onClick={() => deleteOne(row.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            width: '120px',
            ignoreRowClick: true,
        },
    ];

    const csvHeaders = [
        { label: 'ID',        key: 'id' },
        { label: 'Customer',  key: 'customer_name' },
        { label: 'Email',     key: 'customer_email' },
        { label: 'Product',   key: 'product.name' },
        { label: 'Rating',    key: 'rating' },
        { label: 'Comment',   key: 'comment' },
        { label: 'Verified',  key: 'is_verified' },
        { label: 'Status',    key: 'status' },
        { label: 'Helpful',   key: 'helpful_count' },
        { label: 'Date',      key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Reviews" />

            {/* Reply modal */}
            {replyTarget && (
                <ReplyModal
                    review={replyTarget}
                    onClose={() => setReplyTarget(null)}
                    onSaved={refresh}
                />
            )}

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Product Reviews</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Moderate and reply to customer feedback
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard title="Total"    value={stats.total}    color="blue"   icon={MessageSquare} />
                    <StatCard title="Approved" value={stats.approved} color="emerald" icon={CheckCircle} />
                    <StatCard title="Pending"  value={stats.pending}  color="amber"  icon={ShieldAlert} />
                    <StatCard title="Verified" value={stats.verified} color="purple" icon={BarChart2} />
                </div>

                {/* Bulk toolbar — visible only when rows are selected */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {selectedIds.length} selected
                        </span>
                        <button
                            onClick={() => bulkAction('approve')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition"
                        >
                            <ThumbsUp size={13} /> Approve
                        </button>
                        <button
                            onClick={() => bulkAction('reject')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
                        >
                            <ThumbsDown size={13} /> Reject
                        </button>
                        <button
                            onClick={() => bulkAction('delete')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                        >
                            <Trash2 size={13} /> Delete
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* DataTable */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <DataTableWrapper
                        key={tableKey}
                        fetchUrl="/admin/reviews-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['customer_name', 'customer_email', 'comment', 'product.name']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
