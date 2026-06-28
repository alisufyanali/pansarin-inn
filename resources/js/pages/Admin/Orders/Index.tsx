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

        const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
        const mailIcon  = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
        const pinIcon   = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        const cityIcon  = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

        const invoices = selected.map(order => {
            const items = order.items ?? [];
            const date  = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            const itemRows = items.map((item: any, i: number) => `
                <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f0fdf4'};">
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;color:#9ca3af;font-size:11px;">${i + 1}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;font-weight:500;color:#1a1a1a;">${item.product_name ?? '—'}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;color:#6b7280;font-size:11px;">${item.variant_name ?? '—'}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;font-weight:600;">${item.quantity}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:right;color:#374151;">Rs ${Number(item.price).toLocaleString()}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:right;font-weight:700;color:#166534;">Rs ${Number(item.subtotal).toLocaleString()}</td>
                </tr>
            `).join('');

            return `
            <div style="break-inside:avoid;margin-bottom:16px;border-radius:10px;overflow:hidden;border:1px solid #d1fae5;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;background:#fff;box-shadow:0 2px 8px rgba(45,106,79,0.08);">
                <div style="height:5px;background:linear-gradient(90deg,#1b4332,#2d6a4f,#52b788,#95d5b2);"></div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;background:linear-gradient(135deg,#f0fdf4,#ffffff);">
                    <div><img src="/logo.png" style="height:46px;object-fit:contain;" onerror="this.style.display='none'" /></div>
                    <div style="text-align:right;">
                        <div style="font-size:18px;font-weight:800;color:#1b4332;letter-spacing:2px;text-transform:uppercase;">Invoice</div>
                        <div style="font-size:11px;color:#6b7280;margin-top:3px;">
                            <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-weight:600;">${order.order_number}</span>
                        </div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${date}</div>
                    </div>
                </div>
                <div style="height:1px;background:linear-gradient(90deg,transparent,#d1fae5,transparent);margin:0 20px;"></div>
                <div style="display:flex;gap:12px;padding:12px 20px;">
                    <div style="flex:1;background:#f8fffe;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;">
                        <div style="font-size:9px;font-weight:800;color:#2d6a4f;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #d1fae5;padding-bottom:4px;">Bill To</div>
                        <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:5px;">${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}</div>
                        <div style="color:#555;font-size:11px;line-height:1.9;">
                            <div>${phoneIcon}${order.customer?.phone ?? '—'}</div>
                            ${order.customer?.email ? `<div>${mailIcon}${order.customer.email}</div>` : ''}
                        </div>
                    </div>
                    <div style="flex:1;background:#f8f8ff;border:1px solid #c7d2fe;border-radius:8px;padding:10px 14px;">
                        <div style="font-size:9px;font-weight:800;color:#4338ca;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e0e7ff;padding-bottom:4px;">Ship To</div>
                        <div style="color:#555;font-size:11px;line-height:1.9;">
                            ${order.customer?.address ? `<div>${pinIcon}${order.customer.address}</div>` : '<div style="color:#aaa;font-style:italic;">No address provided</div>'}
                            ${order.city?.name ? `<div>${cityIcon}${order.city.name}</div>` : ''}
                            <div>${phoneIcon}${order.customer?.phone ?? '—'}</div>
                        </div>
                    </div>
                </div>
                <div style="padding:0 20px 14px;">
                    <table style="width:100%;border-collapse:collapse;font-size:11px;border-radius:8px;overflow:hidden;border:1px solid #d1fae5;">
                        <thead>
                            <tr style="background:linear-gradient(90deg,#1b4332,#2d6a4f);color:#fff;">
                                <th style="padding:9px 10px;text-align:center;width:32px;font-weight:600;">#</th>
                                <th style="padding:9px 10px;text-align:left;font-weight:600;">Item</th>
                                <th style="padding:9px 10px;text-align:center;width:110px;font-weight:600;">Options</th>
                                <th style="padding:9px 10px;text-align:center;width:50px;font-weight:600;">Qty</th>
                                <th style="padding:9px 10px;text-align:right;width:85px;font-weight:600;">Unit Price</th>
                                <th style="padding:9px 10px;text-align:right;width:85px;font-weight:600;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemRows || '<tr><td colspan="6" style="text-align:center;padding:14px;color:#aaa;font-style:italic;">No items found</td></tr>'}</tbody>
                    </table>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:0 20px 16px;gap:12px;">
                    <div style="font-size:10px;color:#9ca3af;font-style:italic;max-width:200px;line-height:1.6;">
                        Thank you for your order!<br/>
                        For queries contact: pansariinn@gmail.com
                    </div>
                    <div style="min-width:210px;border-radius:8px;overflow:hidden;border:1px solid #d1fae5;">
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Subtotal</span>
                            <span style="font-weight:500;">Rs ${Number(order.subtotal ?? 0).toLocaleString()}</span>
                        </div>
                        ${Number(order.product_discount ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Product Discount</span>
                            <span style="font-weight:500;color:#dc2626;">- Rs ${Number(order.product_discount).toLocaleString()}</span>
                        </div>` : ''}
                        ${Number(order.invoice_discount ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Invoice Discount</span>
                            <span style="font-weight:500;color:#dc2626;">- Rs ${Number(order.invoice_discount).toLocaleString()}</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Shipping</span>
                            <span style="font-weight:500;">Rs ${Number(order.shipping_charges ?? 0).toLocaleString()}</span>
                        </div>
                        ${Number(order.tax ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Tax</span>
                            <span style="font-weight:500;">Rs ${Number(order.tax).toLocaleString()}</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;padding:9px 12px;background:linear-gradient(90deg,#1b4332,#2d6a4f);color:#fff;">
                            <span style="font-weight:700;font-size:12px;">Grand Total</span>
                            <span style="font-weight:800;font-size:13px;">Rs ${Number(order.grand_total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html><html><head><title>Invoices</title>
            <style>
                * { box-sizing:border-box; margin:0; padding:0; }
                body { background:#fff; padding:10px; font-family:'Segoe UI',Arial,sans-serif; }
                @media print { body { padding:0; } @page { margin:8mm; size:A4; } }
            </style>
            </head><body>
            ${invoices}
            <script>window.onload = () => { window.print(); window.close(); }<\/script>
            </body></html>
        `);
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
