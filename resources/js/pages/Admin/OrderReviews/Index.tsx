import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Star, Clock, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Order Reviews', href: '/admin/order-reviews' }];

interface Review {
    id: number;
    rating: number;
    review: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    order?: { id: number; order_number: string };
    customer?: { id: number; first_name: string; last_name: string; phone: string };
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
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );
}

export default function Index({ stats, flash }: { stats: Stats; flash?: { success?: string; error?: string } }) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Customer',
            selector: (row: Review) => row.customer?.first_name || '-',
            sortable: true,
            cell: (row: Review) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.customer?.first_name} {row.customer?.last_name}
                    </span>
                    <span className="text-xs text-gray-500">{row.customer?.phone}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Order',
            selector: (row: Review) => row.order?.order_number || '-',
            cell: (row: Review) => (
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm">
                    {row.order?.order_number ?? '—'}
                </span>
            ),
        },
        {
            name: 'Rating',
            selector: (row: Review) => row.rating,
            sortable: true,
            cell: (row: Review) => <Stars rating={row.rating} />,
        },
        {
            name: 'Review',
            selector: (row: Review) => row.review || '',
            cell: (row: Review) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {row.review || <span className="italic text-gray-400">No review text</span>}
                </span>
            ),
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row: Review) => row.status,
            sortable: true,
            cell: (row: Review) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status]}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({ baseUrl: '/admin/order-reviews', canEdit: true, canDelete: true, showView: true }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Customer', key: 'customer.first_name' },
        { label: 'Order', key: 'order.order_number' },
        { label: 'Rating', key: 'rating' },
        { label: 'Review', key: 'review' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Reviews" />
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Reviews</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage customer reviews for orders</p>
                    </div>
                    <Link
                        href="/admin/order-reviews/create"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Review
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Total"    value={stats.total}      color="blue"    icon={Star} />
                    <StatCard title="Pending"  value={stats.pending}    color="amber"   icon={Clock} />
                    <StatCard title="Approved" value={stats.approved}   color="emerald" icon={CheckCircle} />
                    <StatCard title="Rejected" value={stats.rejected}   color="red"     icon={XCircle} />
                    <StatCard title="Avg Rating" value={`${stats.avg_rating} ★`} color="purple" icon={BarChart2} />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/order-reviews-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['customer.first_name', 'order.order_number', 'review', 'status']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
