import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, ShoppingCart, Clock, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/orders' },
];

interface Order {
    id: number;
    order_number: string;
    subtotal: number;
    grand_total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
    payment_method: string | null;
    created_at: string;
    customer?: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    totalRevenue: number;
}

interface Props {
    stats: Stats;
    flash?: { success?: string; error?: string };
}

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded:   'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
};

const PAYMENT_COLORS: Record<string, string> = {
    paid:           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    unpaid:         'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    refunded:       'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
};

export default function Index({ stats, flash }: Props) {

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Order Number',
            selector: (row: Order) => row.order_number,
            sortable: true,
            cell: (row: Order) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{row.order_number}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(row.created_at).toLocaleDateString()}
                    </span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Customer',
            selector: (row: Order) => row.customer?.first_name || '-',
            sortable: true,
            cell: (row: Order) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.customer ? `${row.customer.first_name} ${row.customer.last_name}` : '—'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.customer?.phone}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Total Amount',
            selector: (row: Order) => row.grand_total,
            sortable: true,
            cell: (row: Order) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">
                        PKR {Number(row.grand_total ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Subtotal: PKR {Number(row.subtotal ?? 0).toFixed(2)}
                    </span>
                </div>
            ),
        },
        {
            name: 'Order Status',
            selector: (row: Order) => row.status,
            sortable: true,
            cell: (row: Order) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] ?? ''}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
        },
        {
            name: 'Payment',
            selector: (row: Order) => row.payment_status,
            sortable: true,
            cell: (row: Order) => (
                <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[row.payment_status] ?? ''}`}>
                        {row.payment_status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    {row.payment_method && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row.payment_method}</span>
                    )}
                </div>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl: '/admin/orders',
            canEdit: true,
            canDelete: true,
            showView: true,
        }),
    ];

    const csvHeaders = [
        { label: 'ID',              key: 'id' },
        { label: 'Order Number',    key: 'order_number' },
        { label: 'Customer',        key: 'customer.first_name' },
        { label: 'Phone',           key: 'customer.phone' },
        { label: 'Subtotal',        key: 'subtotal' },
        { label: 'Grand Total',     key: 'grand_total' },
        { label: 'Status',          key: 'status' },
        { label: 'Payment Status',  key: 'payment_status' },
        { label: 'Payment Method',  key: 'payment_method' },
        { label: 'Created At',      key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage customer orders and track deliveries
                        </p>
                    </div>
                    <Link
                        href="/admin/orders/create"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create New Order
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Orders" value={stats.total}                                        color="blue"   icon={ShoppingCart} />
                    <StatCard title="Pending"      value={stats.pending}                                     color="amber"  icon={Clock} />
                    <StatCard title="Processing"   value={stats.processing}                                  color="purple" icon={TrendingUp} />
                    <StatCard title="Delivered"    value={stats.delivered}                                   color="emerald" icon={CheckCircle} />
                    <StatCard title="Revenue"      value={`PKR ${Number(stats.totalRevenue ?? 0).toFixed(0)}`} color="amber"  icon={DollarSign} />
                </div>

                {/* DataTable */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/orders-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['order_number', 'customer.first_name', 'customer.last_name', 'status', 'payment_status']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}