import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { RotateCcw, Clock, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns', href: '/admin/returns' },
];

interface ReturnRow {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    reason_category: string;
    items_count: number;
    refund_amount: number | null;
    created_at: string;
    order?: { id: number; order_number: string };
    customer?: { id: number; first_name: string; last_name: string; phone: string };
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
}

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const REASON_LABELS: Record<string, string> = {
    defective:  'Defective',
    wrong_item: 'Wrong Item',
    not_needed: 'Not Needed',
    other:      'Other',
};

export default function Index({
    stats,
    flash,
}: {
    stats: Stats;
    flash?: { success?: string; error?: string };
}) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Customer',
            selector: (row: ReturnRow) => row.customer?.first_name ?? '-',
            sortable: true,
            cell: (row: ReturnRow) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.customer?.first_name} {row.customer?.last_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.customer?.phone}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Order',
            selector: (row: ReturnRow) => row.order?.order_number ?? '-',
            cell: (row: ReturnRow) => (
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm">
                    {row.order?.order_number ?? '—'}
                </span>
            ),
        },
        {
            name: 'Reason',
            selector: (row: ReturnRow) => row.reason_category,
            sortable: true,
            cell: (row: ReturnRow) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {REASON_LABELS[row.reason_category] ?? row.reason_category}
                </span>
            ),
        },
        {
            name: 'Items',
            selector: (row: ReturnRow) => row.items_count,
            sortable: true,
            cell: (row: ReturnRow) => (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {row.items_count}
                </span>
            ),
            width: '80px',
        },
        {
            name: 'Refund',
            selector: (row: ReturnRow) => row.refund_amount ?? 0,
            sortable: true,
            cell: (row: ReturnRow) =>
                row.refund_amount != null ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        PKR {Number(row.refund_amount).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                ),
        },
        {
            name: 'Status',
            selector: (row: ReturnRow) => row.status,
            sortable: true,
            cell: (row: ReturnRow) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status]}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl:   '/admin/returns',
            canEdit:   false,
            canDelete: true,
            showView:  true,
        }),
    ];

    const csvHeaders = [
        { label: 'ID',          key: 'id' },
        { label: 'Customer',    key: 'customer.first_name' },
        { label: 'Order',       key: 'order.order_number' },
        { label: 'Reason',      key: 'reason_category' },
        { label: 'Items',       key: 'items_count' },
        { label: 'Refund',      key: 'refund_amount' },
        { label: 'Status',      key: 'status' },
        { label: 'Created At',  key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Return Requests" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Return Requests</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Review, approve, and manage customer return requests
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Total"     value={stats.total}     color="blue"    icon={RotateCcw} />
                    <StatCard title="Pending"   value={stats.pending}   color="amber"   icon={Clock} />
                    <StatCard title="Approved"  value={stats.approved}  color="purple"  icon={CheckCircle} />
                    <StatCard title="Rejected"  value={stats.rejected}  color="red"     icon={XCircle} />
                    <StatCard title="Completed" value={stats.completed} color="emerald" icon={PackageCheck} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/returns-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['customer.first_name', 'order.order_number', 'status', 'reason_category']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
