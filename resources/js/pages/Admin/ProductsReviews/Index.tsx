import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    MessageSquare,
    Plus,
    ShieldAlert,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Reviews', href: '/admin/reviews' },
];

interface Review {
    id: number;
    customer_name: string;
    product: { name: string };
    rating: number;
    comment: string;
    is_verified: boolean;
    status: boolean;
    created_at: string;
}

interface Props {
    stats: {
        total: number;
        verified: number;
        pending: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ stats, flash }: Props) {
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleStatusToggle = (id: number, currentStatus: boolean) => {
        router.patch(
            `/admin/reviews/${id}/status`,
            {
                status: !currentStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Review status updated!');
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this review?')) {
            router.delete(`/admin/reviews/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Review deleted successfully!');
                },
            });
        }
    };

    const columns = [
        CommonColumns.id(),
        {
            name: 'Customer & Product',
            selector: (row: Review) => row.customer_name,
            cell: (row: Review) => (
                <div className="flex flex-col py-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                        {row.customer_name}
                    </span>
                    <span className="text-xs text-gray-500 italic dark:text-gray-400">
                        {row.product?.name}
                    </span>
                </div>
            ),
            sortable: true,
            width: '250px',
        },
        {
            name: 'Rating',
            selector: (row: Review) => row.rating,
            sortable: true,
            cell: (row: Review) => (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={
                                i < row.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            }
                        />
                    ))}
                    <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {row.rating}/5
                    </span>
                </div>
            ),
            width: '140px',
        },
        {
            name: 'Comment',
            selector: (row: Review) => row.comment,
            cell: (row: Review) => (
                <div className="max-w-xs py-2">
                    <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                        {row.comment}
                    </p>
                </div>
            ),
            width: '300px',
        },
        {
            name: 'Verified',
            selector: (row: Review) => row.is_verified,
            sortable: true,
            cell: (row: Review) =>
                row.is_verified ? (
                    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <CheckCircle size={14} /> Verified
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        Guest
                    </span>
                ),
            width: '120px',
        },
        {
            name: 'Status',
            selector: (row: Review) => row.status,
            sortable: true,
            cell: (row: Review) => (
                <button
                    onClick={() => handleStatusToggle(row.id, row.status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        row.status
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                >
                    {row.status ? 'Approved' : 'Pending'}
                </button>
            ),
            width: '120px',
        },
        CommonColumns.createdAt(true),
        {
            name: 'Actions',
            cell: (row: Review) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/reviews/${row.id}/edit`}
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            width: '100px',
            right: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Reviews" />
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">
                            Product Reviews
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Manage customer feedback and verifications
                        </p>
                    </div>
                    <Link
                        href="/admin/reviews/create"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                    >
                        <Plus size={20} />
                        Add Review
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Total Reviews"
                        value={stats?.total || 0}
                        color="blue"
                        icon={MessageSquare}
                    />
                    <StatCard
                        title="Verified Purchases"
                        value={stats?.verified || 0}
                        color="emerald"
                        icon={CheckCircle}
                    />
                    <StatCard
                        title="Pending Approval"
                        value={stats?.pending || 0}
                        color="amber"
                        icon={ShieldAlert}
                    />
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <DataTableWrapper
                        fetchUrl="/admin/reviews-data"
                        columns={columns}
                        searchableKeys={[
                            'customer_name',
                            'comment',
                            'product.name',
                        ]}
                        csvHeaders={[
                            { label: 'ID', key: 'id' },
                            { label: 'Customer', key: 'customer_name' },
                            { label: 'Product', key: 'product.name' },
                            { label: 'Rating', key: 'rating' },
                            { label: 'Comment', key: 'comment' },
                            { label: 'Verified', key: 'is_verified' },
                            { label: 'Status', key: 'status' },
                            { label: 'Date', key: 'created_at' },
                        ]}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
