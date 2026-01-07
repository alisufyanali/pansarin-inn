import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    MessageSquare,
    PlusCircle,
    Star,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Comments', href: '/admin/blogscomments' },
];

interface BlogComment {
    id: number;
    blog_id?: number;
    user_id?: number;
    comments: string;
    review?: string;
    rating?: number;
    status: 'pending' | 'approved' | 'rejected';
    blog_title?: string;
    user_name?: string;
    created_at: string;
    updated_at?: string;
}

interface Props {
    stats?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        with_rating: number;
        avg_rating: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ stats, flash }: Props) {
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    // Use stats from props with defaults
    const commentStats = stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        with_rating: 0,
        avg_rating: 0,
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'rejected':
                return 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400';
            default:
                return 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400';
        }
    };

    // Render star rating
    const renderStars = (rating?: number) => {
        if (!rating)
            return <span className="text-xs text-gray-400">No rating</span>;
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                        }`}
                    />
                ))}
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                    {rating}/5
                </span>
            </div>
        );
    };

    // Define columns
    const columns = [
        CommonColumns.id(),
        {
            name: 'Blog',
            selector: (row: BlogComment) => row.blog_title || 'N/A',
            sortable: true,
            cell: (row: BlogComment) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {row.blog_title || (
                        <span className="text-gray-400">N/A</span>
                    )}
                </span>
            ),
            width: '180px',
        },
        {
            name: 'User',
            selector: (row: BlogComment) => row.user_name || 'Guest',
            sortable: true,
            cell: (row: BlogComment) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {row.user_name || (
                        <span className="text-gray-400 italic">Guest</span>
                    )}
                </span>
            ),
            width: '140px',
        },
        {
            name: 'Comment',
            selector: (row: BlogComment) => row.comments,
            sortable: true,
            cell: (row: BlogComment) => (
                <div className="flex flex-col py-2">
                    <span className="line-clamp-2 text-gray-900 dark:text-white">
                        {row.comments.length > 80
                            ? `${row.comments.substring(0, 80)}...`
                            : row.comments}
                    </span>
                    {row.review && (
                        <span className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            ✓ Has review
                        </span>
                    )}
                </div>
            ),
            width: '250px',
            wrap: true,
        },
        {
            name: 'Rating',
            selector: (row: BlogComment) => row.rating || 0,
            sortable: true,
            cell: (row: BlogComment) => renderStars(row.rating),
            width: '140px',
            center: true,
        },
        {
            name: 'Status',
            selector: (row: BlogComment) => row.status,
            sortable: true,
            cell: (row: BlogComment) => (
                <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusColor(row.status)}`}
                >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
            width: '130px',
            center: true,
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl: '/admin/blogscomments',
            canEdit,
            canDelete,
        }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Blog', key: 'blog_title' },
        { label: 'User', key: 'user_name' },
        { label: 'Comment', key: 'comments' },
        { label: 'Review', key: 'review' },
        { label: 'Rating', key: 'rating' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Additional filters for comments
    const additionalFilters = [
        {
            name: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
        },
        {
            name: 'rating',
            label: 'Rating',
            type: 'select' as const,
            options: [
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
            ],
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog Comments" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Blog Comments & Reviews
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage user comments, reviews, and ratings on blog
                            posts
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/admin/blogscomments/create"
                            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Add Comment</span>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Comments"
                        value={commentStats.total}
                        color="blue"
                        icon={MessageSquare}
                    />
                    <StatCard
                        title="Pending"
                        value={commentStats.pending}
                        color="amber"
                        icon={Clock}
                    />
                    <StatCard
                        title="Approved"
                        value={commentStats.approved}
                        color="emerald"
                        icon={CheckCircle}
                    />
                    <StatCard
                        title="Rejected"
                        value={commentStats.rejected}
                        color="red"
                        icon={XCircle}
                    />
                    <StatCard
                        title="Avg Rating"
                        value={commentStats.avg_rating}
                        color="purple"
                        icon={Star}
                        suffix="★"
                    />
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <DataTableWrapper
                        fetchUrl="/admin/blogscomments-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={[
                            'comments',
                            'review',
                            'blog_title',
                            'user_name',
                        ]}
                        additionalFilters={additionalFilters}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

// Reusable Stat Card Component
function StatCard({
    title,
    value,
    color,
    icon: Icon,
    suffix = '',
}: {
    title: string;
    value: number;
    color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
    icon: any;
    suffix?: string;
}) {
    const colorClasses = {
        blue: {
            bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
            border: 'border-blue-200 dark:border-blue-700',
            text: 'text-blue-700 dark:text-blue-300',
            value: 'text-blue-900 dark:text-blue-100',
            icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
        },
        emerald: {
            bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
            border: 'border-emerald-200 dark:border-emerald-700',
            text: 'text-emerald-700 dark:text-emerald-300',
            value: 'text-emerald-900 dark:text-emerald-100',
            icon: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300',
        },
        amber: {
            bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
            border: 'border-amber-200 dark:border-amber-700',
            text: 'text-amber-700 dark:text-amber-300',
            value: 'text-amber-900 dark:text-amber-100',
            icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
        },
        red: {
            bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
            border: 'border-red-200 dark:border-red-700',
            text: 'text-red-700 dark:text-red-300',
            value: 'text-red-900 dark:text-red-100',
            icon: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
        },
        purple: {
            bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
            border: 'border-purple-200 dark:border-purple-700',
            text: 'text-purple-700 dark:text-purple-300',
            value: 'text-purple-900 dark:text-purple-100',
            icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
        },
    };

    const classes = colorClasses[color];

    return (
        <div
            className={`bg-gradient-to-br ${classes.bg} border ${classes.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${classes.text}`}>
                        {title}
                    </p>
                    <p className={`mt-2 text-3xl font-bold ${classes.value}`}>
                        {value}
                        {suffix}
                    </p>
                </div>
                <div className={`p-3 ${classes.icon} rounded-lg`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
