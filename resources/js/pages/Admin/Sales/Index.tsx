import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, ShoppingBag, Clock, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales', href: '/admin/sales' },
];

interface Sale {
    id: number;
    order_id: number;
    customer_id: number;
    sale_code: string;
    subtotal: number;
    product_discount: number;
    invoice_discount: number;
    vat: number;
    vat_percent: string | null;
    shipping_charges: number;
    grand_total: number;
    delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
    payment_type: string | null;
    shipping_method: string | null;
    customer?: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
    };
    order?: {
        id: number;
        order_number: string;
    };
    created_at: string;
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
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ stats, flash }: Props) {
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    // Define columns
    const columns = [
        CommonColumns.id(),
        {
            name: 'Sale Code',
            selector: (row: Sale) => row.sale_code,
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                        {row.sale_code}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Order: {row.order?.order_number || '-'}
                    </span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Customer',
            selector: (row: Sale) => row.customer?.first_name || '-',
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.customer?.first_name} {row.customer?.last_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {row.customer?.phone}
                    </span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Total Amount',
            selector: (row: Sale) => row.grand_total,
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">
                        PKR {row.grand_total.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Subtotal: PKR {row.subtotal.toFixed(2)}
                    </span>
                </div>
            ),
        },
        {
            name: 'Delivery Status',
            selector: (row: Sale) => row.delivery_status,
            sortable: true,
            cell: (row: Sale) => {
                const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                };

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.delivery_status]}`}>
                        {row.delivery_status.charAt(0).toUpperCase() + row.delivery_status.slice(1)}
                    </span>
                );
            },
        },
        {
            name: 'Payment',
            selector: (row: Sale) => row.payment_status,
            sortable: true,
            cell: (row: Sale) => {
                const paymentColors: Record<string, string> = {
                    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                };

                return (
                    <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentColors[row.payment_status]}`}>
                            {row.payment_status.replace('_', ' ').charAt(0).toUpperCase() + row.payment_status.replace('_', ' ').slice(1)}
                        </span>
                        {row.payment_type && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {row.payment_type}
                            </span>
                        )}
                    </div>
                );
            },
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl: '/admin/sales',
            canEdit,
            canDelete,
            showView: true,
        }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Sale Code', key: 'sale_code' },
        { label: 'Order Number', key: 'order.order_number' },
        { label: 'Customer', key: 'customer.first_name' },
        { label: 'Phone', key: 'customer.phone' },
        { label: 'Subtotal', key: 'subtotal' },
        { label: 'Product Discount', key: 'product_discount' },
        { label: 'Invoice Discount', key: 'invoice_discount' },
        { label: 'VAT', key: 'vat' },
        { label: 'Shipping', key: 'shipping_charges' },
        { label: 'Grand Total', key: 'grand_total' },
        { label: 'Delivery Status', key: 'delivery_status' },
        { label: 'Payment Status', key: 'payment_status' },
        { label: 'Payment Type', key: 'payment_type' },
        { label: 'Created At', key: 'created_at' },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Sales
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage sales and track deliveries
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/admin/sales/create"
                            className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Create New Sale</span>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Sales" value={stats.total} color="blue" icon={ShoppingBag} />
                    <StatCard title="Pending" value={stats.pending} color="amber" icon={Clock} />
                    <StatCard title="Processing" value={stats.processing} color="purple" icon={TrendingUp} />
                    <StatCard title="Delivered" value={stats.delivered} color="emerald" icon={CheckCircle} />
                    <StatCard
                        title="Revenue"
                        value={`${stats.totalRevenue.toFixed(0)}`}
                        color="amber"
                        icon={DollarSign}
                    />
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/sales-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['sale_code', 'order.order_number', 'customer.first_name', 'customer.last_name', 'customer.phone', 'delivery_status', 'payment_status']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}