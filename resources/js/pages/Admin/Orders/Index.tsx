import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, ShoppingCart, Clock, TrendingUp, CheckCircle, DollarSign, ShoppingBag, Printer, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';
import axios from 'axios';
import { PAYMENT_METHOD_OPTIONS, SHIPPING_METHOD_OPTIONS } from '@/constants/orderOptions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/orders' },
];

function getOptionLabel(options: readonly { value: string; label: string }[], value: string | null): string {
    if (!value) return '—';
    return options.find(o => o.value === value)?.label ?? value;
}

interface OrderItem {
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: number;
    order_number: string;
    subtotal: number;
    product_discount: number;
    invoice_discount: number;
    shipping_charges: number;
    tax: number;
    grand_total: number;
    status: string;
    payment_status: string;
    payment_method: string | null;
    created_at: string;
    shipping_address?: string | null;
    customer?: { id: number; first_name: string; last_name: string; phone: string; email?: string; address?: string };
    city?: { name: string } | null;
    items?: OrderItem[];
    sales_count?: number;
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
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [allRows, setAllRows] = useState<Order[]>([]);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const allSelected = allRows.length > 0 && allRows.every(r => selectedIds.has(r.id));

    function toggleAll() {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allRows.map(r => r.id)));
        }
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
        if (selected.length === 0) {
            toast.error('Please select at least one order to print.');
            return;
        }

        // Build one row per order in the dispatch list table
        const orderRows = selected.map(order => {
            const customerName = order.customer
                ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
                : '—';
            const phone = order.customer?.phone ?? '—';

            // City: prefer linked city object, fallback to shipping_address first word/line
            let city = order.city?.name ?? '';
            if (!city && (order as any).shipping_address) {
                // shipping_address se pehli line ya last meaningful word nikaalo
                const addr: string = (order as any).shipping_address;
                const lines = addr.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
                city = lines[lines.length - 1] ?? lines[0] ?? '';
            }
            if (!city) city = '—';

            const items = order.items ?? [];

            // Product detail: nested table — product name + variant (gm/ml/unit) + qty
            const productRows = items.length > 0
                ? items.map(item => {
                    // variant_name already contains the full label e.g. "100 gm", "50 gm Whole", "30 ml"
                    const variantLabel = item.variant_name?.trim() ?? '';
                    const variantCell  = variantLabel
                        ? `<td style="padding:3px 6px;border:1px solid #ccc;font-size:11px;white-space:nowrap;color:#444;">${variantLabel}</td>`
                        : `<td style="padding:3px 6px;border:1px solid #ccc;font-size:11px;color:#bbb;">—</td>`;
                    return `
                        <tr>
                            <td style="padding:3px 6px;border:1px solid #ccc;font-size:11px;">${item.product_name ?? '—'}</td>
                            ${variantCell}
                            <td style="padding:3px 6px;border:1px solid #ccc;font-size:11px;text-align:center;white-space:nowrap;">${item.quantity} qty</td>
                        </tr>`;
                }).join('')
                : `<tr><td colspan="3" style="padding:3px 6px;border:1px solid #ccc;font-size:11px;color:#aaa;font-style:italic;">No items</td></tr>`;

            const productCell = `
                <table style="border-collapse:collapse;width:100%;">
                    <thead>
                        <tr style="background:#636363;">
                            <th style="padding:3px 6px;border:1px solid #ccc;font-size:10px;text-align:left;font-weight:600;">Product</th>
                            <th style="padding:3px 6px;border:1px solid #ccc;font-size:10px;text-align:left;font-weight:600;white-space:nowrap;">Size / Unit</th>
                            <th style="padding:3px 6px;border:1px solid #ccc;font-size:10px;text-align:center;font-weight:600;">Qty</th>
                        </tr>
                    </thead>
                    <tbody>${productRows}</tbody>
                </table>`;

            return `
                <tr>
                    <td style="padding:8px 10px;border:1px solid #999;text-align:center;font-weight:700;font-size:12px;vertical-align:top;white-space:nowrap;">${order.order_number}</td>
                    <td style="padding:8px 10px;border:1px solid #999;font-size:12px;vertical-align:top;white-space:nowrap;">${customerName}</td>
                    <td style="padding:8px 10px;border:1px solid #999;font-size:12px;vertical-align:top;white-space:nowrap;">${phone}</td>
                    <td style="padding:8px 10px;border:1px solid #999;font-size:12px;vertical-align:top;white-space:nowrap;">${city}</td>
                    <td style="padding:4px 6px;border:1px solid #999;vertical-align:top;">${productCell}</td>
                    <td style="padding:8px 10px;border:1px solid #999;font-size:12px;font-weight:700;vertical-align:top;text-align:right;white-space:nowrap;">Rs ${Number(order.grand_total ?? 0).toLocaleString()}</td>
                </tr>`;
        }).join('');

        const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Orders Dispatch List</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; background: #fff; padding: 16px; }
        h2  { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #555; margin-bottom: 12px; }
        table.main { width: 100%; border-collapse: collapse; }
        table.main thead tr { background: #222; color: #fff; }
        table.main thead th { padding: 8px 10px; border: 1px solid #555; font-size: 12px; text-align: left; }
        table.main thead th:last-child { text-align: right; }
        table.main tbody tr:nth-child(even) { background: #f9f9f9; }
        @media print {
            body { padding: 0; }
            @page { margin: 10mm; size: A4; }
        }
    </style>
</head>
<body>
    <h2>Orders Dispatch List</h2>
    <div class="meta">Printed: ${printDate} &nbsp;|&nbsp; Total orders: ${selected.length}</div>
    <table class="main">
        <thead>
            <tr>
                <th style="width:110px;">Order #</th>
                <th style="width:120px;">Name</th>
                <th style="width:110px;">Phone</th>
                <th style="width:90px;">City</th>
                <th>Product Detail</th>
                <th style="width:100px;text-align:right;">Total Price</th>
            </tr>
        </thead>
        <tbody>
            ${orderRows}
        </tbody>
    </table>
    <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) { toast.error('Popup blocked — please allow popups for this site.'); return; }
        win.document.write(html);
        win.document.close();
    }

    async function handleBulkEmail() {
        if (selectedIds.size === 0) { toast.error('Please select at least one order.'); return; }
        try {
            const res = await axios.post('/admin/orders/bulk-send-email', { ids: [...selectedIds] });
            toast.success(`Email queued for ${res.data.sent} order(s).`);
        } catch {
            toast.error('Failed to send emails.');
        }
    }

    async function handleBulkWhatsApp() {
        if (selectedIds.size === 0) { toast.error('Please select at least one order.'); return; }
        try {
            const res = await axios.post('/admin/orders/bulk-send-whatsapp', { ids: [...selectedIds] });
            toast.success(`WhatsApp queued for ${res.data.sent} order(s).`);
        } catch {
            toast.error('Failed to send WhatsApp messages.');
        }
    }

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
            ),
            cell: (row: Order) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
            ),
            width: '50px',
            ignoreRowClick: true,
        },
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
            name: 'Total',
            selector: (row: Order) => row.grand_total,
            sortable: true,
            cell: (row: Order) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    PKR {Number(row.grand_total ?? 0).toLocaleString()}
                </span>
            ),
        },
        {
            name: 'Status',
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
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getOptionLabel(PAYMENT_METHOD_OPTIONS, row.payment_method)}
                        </span>
                    )}
                </div>
            ),
        },
        CommonColumns.actions({ baseUrl: '/admin/orders', canEdit: true, canDelete: true, showView: true }),
        {
            name: 'Sale',
            cell: (row: Order) => row.sales_count === 0 && (
                <Link
                    href={`/admin/sales/create-from-order/${row.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
                >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Sale
                </Link>
            ),
            width: '90px',
            ignoreRowClick: true,
        },
    ];

    const csvHeaders = [
        { label: 'ID',             key: 'id' },
        { label: 'Order Number',   key: 'order_number' },
        { label: 'Customer',       key: 'customer.first_name' },
        { label: 'Phone',          key: 'customer.phone' },
        { label: 'Grand Total',    key: 'grand_total' },
        { label: 'Status',         key: 'status' },
        { label: 'Payment Status', key: 'payment_status' },
        { label: 'Created At',     key: 'created_at' },
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
                    <div className="flex items-center gap-3 flex-wrap">
                        {selectedIds.size > 0 && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print ({selectedIds.size})
                                </button>
                                <button
                                    onClick={handleBulkEmail}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email ({selectedIds.size})
                                </button>
                                <button
                                    onClick={handleBulkWhatsApp}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp ({selectedIds.size})
                                </button>
                            </>
                        )}
                        <Link
                            href="/admin/orders/create"
                            className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Create New Order
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Orders" value={stats.total}     color="blue"    icon={ShoppingCart} />
                    <StatCard title="Pending"      value={stats.pending}   color="amber"   icon={Clock} />
                    <StatCard title="Processing"   value={stats.processing} color="purple" icon={TrendingUp} />
                    <StatCard title="Delivered"    value={stats.delivered} color="emerald" icon={CheckCircle} />
                    <StatCard title="Revenue"      value={`PKR ${Number(stats.totalRevenue ?? 0).toLocaleString()}`} color="amber" icon={DollarSign} />
                </div>

                {/* DataTable */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/orders-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['order_number', 'customer.first_name', 'status']}
                        onDataLoaded={(rows: Order[]) => {
                            setAllRows(rows);
                            setSelectedIds(new Set());
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
