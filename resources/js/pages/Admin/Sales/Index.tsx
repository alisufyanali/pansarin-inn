import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, ShoppingBag, Clock, TrendingUp, CheckCircle, DollarSign, Printer } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales', href: '/admin/sales' },
];

interface SaleItem {
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    sale_code: string;
    subtotal: number;
    shipping_charges: number;
    grand_total: number;
    delivery_status: string;
    payment_status: string;
    payment_type: string | null;
    created_at: string;
    customer?: { id: number; first_name: string; last_name: string; phone: string; email?: string; address?: string };
    city?: { name: string } | null;
    order?: { id: number; order_number: string };
    items?: SaleItem[];
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

const DELIVERY_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    returned:   'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
};

const PAYMENT_COLORS: Record<string, string> = {
    paid:           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    unpaid:         'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    refunded:       'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
};

export default function Index({ stats, flash }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [allRows, setAllRows] = useState<Sale[]>([]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const allSelected = allRows.length > 0 && allRows.every(r => selectedIds.has(r.id));

    function toggleAll() {
        setSelectedIds(allSelected ? new Set() : new Set(allRows.map(r => r.id)));
    }

    function toggleRow(id: number) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handlePrint() {
        const selected = allRows.filter(r => selectedIds.has(r.id));
        if (selected.length === 0) { toast.error('Please select at least one sale.'); return; }

        const invoices = selected.map(sale => {
            const items = sale.items ?? [];
            const itemRows = items.map((item, i) => `
                <tr>
                    <td style="border:1px solid #ddd;padding:5px 8px;text-align:center;">${i + 1}</td>
                    <td style="border:1px solid #ddd;padding:5px 8px;">${item.product_name}</td>
                    <td style="border:1px solid #ddd;padding:5px 8px;text-align:center;">${item.variant_name ?? '—'}</td>
                    <td style="border:1px solid #ddd;padding:5px 8px;text-align:center;">${item.quantity}</td>
                    <td style="border:1px solid #ddd;padding:5px 8px;text-align:right;">Rs${Number(item.price).toLocaleString()}</td>
                    <td style="border:1px solid #ddd;padding:5px 8px;text-align:right;">Rs${Number(item.subtotal).toLocaleString()}</td>
                </tr>
            `).join('');

            const date = new Date(sale.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            return `
            <div style="break-inside:avoid;border:1px solid #ccc;border-radius:6px;padding:16px;margin-bottom:12px;font-family:Arial,sans-serif;font-size:12px;">
                <!-- Header -->
                <table style="width:100%;margin-bottom:10px;">
                    <tr>
                        <td style="vertical-align:middle;">
                            <img src="/logo.png" style="height:48px;object-fit:contain;" onerror="this.style.display='none'" />
                        </td>
                        <td style="text-align:right;vertical-align:middle;font-size:11px;line-height:1.7;">
                            <strong>Guest Id: ${sale.sale_code}</strong><br/>
                            <strong>Invoice No: ${sale.order?.order_number ?? sale.sale_code}</strong><br/>
                            <strong>Date: ${date}</strong>
                        </td>
                    </tr>
                </table>

                <hr style="border:none;border-top:1px solid #ddd;margin:8px 0;"/>

                <!-- Client Info -->
                <table style="width:100%;margin-bottom:10px;border-collapse:collapse;">
                    <tr>
                        <td style="width:48%;vertical-align:top;padding-right:8px;">
                            <div style="border:1px solid #ddd;padding:8px;border-radius:4px;">
                                <div style="font-weight:700;font-size:11px;margin-bottom:6px;color:#555;">Client Information</div>
                                <table style="font-size:11px;width:100%;border-collapse:collapse;">
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;width:80px;">First Name</td><td style="font-weight:600;">${sale.customer?.first_name ?? ''}</td></tr>
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;">Last Name</td><td style="font-weight:600;">${sale.customer?.last_name ?? ''}</td></tr>
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;">Phone</td><td style="font-weight:600;">${sale.customer?.phone ?? ''}</td></tr>
                                </table>
                            </div>
                        </td>
                        <td style="width:4%;"></td>
                        <td style="width:48%;vertical-align:top;">
                            <div style="border:1px solid #ddd;padding:8px;border-radius:4px;">
                                <div style="font-weight:700;font-size:11px;margin-bottom:6px;color:#555;">Client Information</div>
                                <table style="font-size:11px;width:100%;border-collapse:collapse;">
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;width:60px;">Address</td><td style="font-weight:600;">${sale.customer?.address ?? ''}</td></tr>
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;">Phone</td><td style="font-weight:600;">${sale.customer?.phone ?? ''}</td></tr>
                                    <tr><td style="color:#888;padding:2px 6px 2px 0;">E-mail</td><td style="font-weight:600;">${sale.customer?.email ?? ''}</td></tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Items Table -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11px;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="border:1px solid #ddd;padding:6px;text-align:center;width:30px;">No</th>
                            <th style="border:1px solid #ddd;padding:6px;text-align:left;">Item</th>
                            <th style="border:1px solid #ddd;padding:6px;text-align:center;width:100px;">Options</th>
                            <th style="border:1px solid #ddd;padding:6px;text-align:center;width:60px;">Qty</th>
                            <th style="border:1px solid #ddd;padding:6px;text-align:right;width:80px;">Unit Cost</th>
                            <th style="border:1px solid #ddd;padding:6px;text-align:right;width:80px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows || '<tr><td colspan="6" style="text-align:center;padding:10px;color:#aaa;">No items</td></tr>'}</tbody>
                </table>

                <!-- Totals -->
                <table style="width:260px;margin-left:auto;font-size:11px;border-collapse:collapse;">
                    <tr><td style="padding:3px 8px;color:#555;">Sub Total Amount</td><td style="padding:3px 8px;text-align:right;">Rs${Number(sale.subtotal).toLocaleString()}.00</td></tr>
                    <tr><td style="padding:3px 8px;color:#555;">Shipping</td><td style="padding:3px 8px;text-align:right;">Rs${Number(sale.shipping_charges).toLocaleString()}.00</td></tr>
                    <tr style="border-top:2px solid #333;">
                        <td style="padding:5px 8px;font-weight:700;font-size:12px;">Grand Total</td>
                        <td style="padding:5px 8px;text-align:right;font-weight:700;font-size:12px;">Rs${Number(sale.grand_total).toLocaleString()}.00</td>
                    </tr>
                </table>
            </div>
            `;
        }).join('');

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html><html><head><title>Sales Invoices</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 12px; padding: 0; background: #fff; }
                @media print {
                    body { margin: 6mm; }
                    @page { margin: 8mm; size: A4; }
                }
            </style>
            </head><body>
            ${invoices}
            <script>window.onload=()=>{window.print();window.close();}<\/script>
            </body></html>
        `);
        win.document.close();
    }

    const columns = [
        {
            name: (
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
            ),
            cell: (row: Sale) => (
                <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRow(row.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
            ),
            width: '50px',
            ignoreRowClick: true,
        },
        CommonColumns.id(),
        {
            name: 'Sale Code',
            selector: (row: Sale) => row.sale_code,
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{row.sale_code}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Order: {row.order?.order_number || '-'}</span>
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.customer?.phone}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Total',
            selector: (row: Sale) => row.grand_total,
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">PKR {Number(row.grand_total).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sub: PKR {Number(row.subtotal).toLocaleString()}</span>
                </div>
            ),
        },
        {
            name: 'Delivery',
            selector: (row: Sale) => row.delivery_status,
            sortable: true,
            cell: (row: Sale) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DELIVERY_COLORS[row.delivery_status] ?? ''}`}>
                    {row.delivery_status.charAt(0).toUpperCase() + row.delivery_status.slice(1)}
                </span>
            ),
        },
        {
            name: 'Payment',
            selector: (row: Sale) => row.payment_status,
            sortable: true,
            cell: (row: Sale) => (
                <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[row.payment_status] ?? ''}`}>
                        {row.payment_status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    {row.payment_type && <span className="text-xs text-gray-500 dark:text-gray-400">{row.payment_type}</span>}
                </div>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({ baseUrl: '/admin/sales', canEdit: true, canDelete: true, showView: true }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Sale Code', key: 'sale_code' },
        { label: 'Order Number', key: 'order.order_number' },
        { label: 'Customer', key: 'customer.first_name' },
        { label: 'Phone', key: 'customer.phone' },
        { label: 'Subtotal', key: 'subtotal' },
        { label: 'Shipping', key: 'shipping_charges' },
        { label: 'Grand Total', key: 'grand_total' },
        { label: 'Delivery Status', key: 'delivery_status' },
        { label: 'Payment Status', key: 'payment_status' },
        { label: 'Created At', key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage sales and track deliveries</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-semibold transition-all shadow-md"
                            >
                                <Printer className="w-4 h-4" />
                                Print Invoice ({selectedIds.size})
                            </button>
                        )}
                        <Link
                            href="/admin/sales/create"
                            className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Create New Sale
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Sales"  value={stats.total}                                          color="blue"    icon={ShoppingBag} />
                    <StatCard title="Pending"      value={stats.pending}                                        color="amber"   icon={Clock} />
                    <StatCard title="Processing"   value={stats.processing}                                     color="purple"  icon={TrendingUp} />
                    <StatCard title="Delivered"    value={stats.delivered}                                      color="emerald" icon={CheckCircle} />
                    <StatCard title="Revenue"      value={`PKR ${Number(stats.totalRevenue).toLocaleString()}`} color="amber"   icon={DollarSign} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/sales-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['sale_code', 'customer.first_name', 'customer.phone', 'delivery_status']}
                        onDataLoaded={(rows: Sale[]) => {
                            setAllRows(rows);
                            setSelectedIds(new Set());
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
