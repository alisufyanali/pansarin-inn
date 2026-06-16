import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, ShoppingBag, Clock, TrendingUp, CheckCircle, DollarSign, Printer, CreditCard, Truck, Star, MessageCircle, Mail } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';
import axios from 'axios';

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
    product_discount: number;
    invoice_discount: number;
    shipping_charges: number;
    vat: number;
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
    const [paymentDropdown, setPaymentDropdown] = useState(false);
    const [deliveryDropdown, setDeliveryDropdown] = useState(false);
    const paymentRef = useRef<HTMLDivElement>(null);
    const deliveryRef = useRef<HTMLDivElement>(null);
    const tableRefresh = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (paymentRef.current && !paymentRef.current.contains(e.target as Node)) setPaymentDropdown(false);
            if (deliveryRef.current && !deliveryRef.current.contains(e.target as Node)) setDeliveryDropdown(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

        // SVG icons as inline strings
        const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
        const mailIcon  = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
        const pinIcon   = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        const cityIcon  = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

        const invoices = selected.map(sale => {
            const items = sale.items ?? [];
            const date  = new Date(sale.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            const itemRows = items.map((item, i) => `
                <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f0fdf4'};">
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;color:#9ca3af;font-size:11px;">${i + 1}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;font-weight:500;color:#1a1a1a;">${item.product_name}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;color:#6b7280;font-size:11px;">${item.variant_name ?? '—'}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:center;font-weight:600;">${item.quantity}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:right;color:#374151;">Rs ${Number(item.price).toLocaleString()}</td>
                    <td style="padding:7px 10px;border-bottom:1px solid #e8f5e9;text-align:right;font-weight:700;color:#166534;">Rs ${Number(item.subtotal).toLocaleString()}</td>
                </tr>
            `).join('');

            return `
            <div style="break-inside:avoid;margin-bottom:16px;border-radius:10px;overflow:hidden;border:1px solid #d1fae5;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;background:#fff;box-shadow:0 2px 8px rgba(45,106,79,0.08);">

                <!-- Top accent bar -->
                <div style="height:5px;background:linear-gradient(90deg,#1b4332,#2d6a4f,#52b788,#95d5b2);"></div>

                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;background:linear-gradient(135deg,#f0fdf4,#ffffff);">
                    <div>
                        <img src="/logo.png" style="height:46px;object-fit:contain;" onerror="this.style.display='none'" />
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:18px;font-weight:800;color:#1b4332;letter-spacing:2px;text-transform:uppercase;">Invoice</div>
                        <div style="font-size:11px;color:#6b7280;margin-top:3px;">
                            <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-weight:600;">${sale.order?.order_number ?? sale.sale_code}</span>
                        </div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${date}</div>
                    </div>
                </div>

                <div style="height:1px;background:linear-gradient(90deg,transparent,#d1fae5,transparent);margin:0 20px;"></div>

                <!-- Client Info -->
                <div style="display:flex;gap:12px;padding:12px 20px;">
                    <div style="flex:1;background:#f8fffe;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;">
                        <div style="font-size:9px;font-weight:800;color:#2d6a4f;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #d1fae5;padding-bottom:4px;">Bill To</div>
                        <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:5px;">${sale.customer?.first_name ?? ''} ${sale.customer?.last_name ?? ''}</div>
                        <div style="color:#555;font-size:11px;line-height:1.9;">
                            <div>${phoneIcon}${sale.customer?.phone ?? '—'}</div>
                            ${sale.customer?.email ? `<div>${mailIcon}${sale.customer.email}</div>` : ''}
                        </div>
                    </div>
                    <div style="flex:1;background:#f8f8ff;border:1px solid #c7d2fe;border-radius:8px;padding:10px 14px;">
                        <div style="font-size:9px;font-weight:800;color:#4338ca;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e0e7ff;padding-bottom:4px;">Ship To</div>
                        <div style="color:#555;font-size:11px;line-height:1.9;">
                            ${sale.customer?.address
                                ? `<div>${pinIcon}${sale.customer.address}</div>`
                                : '<div style="color:#aaa;font-style:italic;">No address provided</div>'}
                            ${sale.city?.name ? `<div>${cityIcon}${sale.city.name}</div>` : ''}
                            <div>${phoneIcon}${sale.customer?.phone ?? '—'}</div>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
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

                <!-- Totals + Footer -->
                <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:0 20px 16px;gap:12px;">
                    <div style="font-size:10px;color:#9ca3af;font-style:italic;max-width:200px;line-height:1.6;">
                        Thank you for your order!<br/>
                        For queries contact: pansariinn@gmail.com
                    </div>
                    <div style="min-width:210px;border-radius:8px;overflow:hidden;border:1px solid #d1fae5;">
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Subtotal</span>
                            <span style="font-weight:500;">Rs ${Number(sale.subtotal).toLocaleString()}</span>
                        </div>
                        ${Number(sale.product_discount ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Product Discount</span>
                            <span style="font-weight:500;color:#dc2626;">- Rs ${Number(sale.product_discount).toLocaleString()}</span>
                        </div>` : ''}
                        ${Number(sale.invoice_discount ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Invoice Discount</span>
                            <span style="font-weight:500;color:#dc2626;">- Rs ${Number(sale.invoice_discount).toLocaleString()}</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">Shipping</span>
                            <span style="font-weight:500;">Rs ${Number(sale.shipping_charges ?? 0).toLocaleString()}</span>
                        </div>
                        ${Number(sale.vat ?? 0) > 0 ? `
                        <div style="display:flex;justify-content:space-between;padding:6px 12px;background:#f0fdf4;font-size:11px;border-bottom:1px solid #d1fae5;">
                            <span style="color:#6b7280;">VAT</span>
                            <span style="font-weight:500;">Rs ${Number(sale.vat).toLocaleString()}</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;padding:9px 12px;background:linear-gradient(90deg,#1b4332,#2d6a4f);color:#fff;">
                            <span style="font-weight:700;font-size:12px;">Grand Total</span>
                            <span style="font-weight:800;font-size:13px;">Rs ${Number(sale.grand_total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </div>
            `;
        }).join('');

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html><html><head><title>Invoices</title>
            <style>
                * { box-sizing:border-box; margin:0; padding:0; }
                body { background:#fff; padding:10px; font-family:'Segoe UI',Arial,sans-serif; }
                @media print {
                    body { padding:0; }
                    @page { margin:8mm; size:A4; }
                }
            </style>
            </head><body>
            ${invoices}
            <script>window.onload=()=>{window.print();window.close();}<\/script>
            </body></html>
        `);
        win.document.close();
    }

    async function handleBulkPayment(status: string) {
        try {
            await axios.post('/admin/sales/bulk-payment-status', { ids: [...selectedIds], payment_status: status });
            toast.success(`Payment status updated to "${status}" for ${selectedIds.size} sale(s).`);
            setPaymentDropdown(false);
            tableRefresh.current?.();
        } catch { toast.error('Failed to update payment status.'); }
    }

    async function handleBulkDelivery(status: string) {
        try {
            await axios.post('/admin/sales/bulk-delivery-status', { ids: [...selectedIds], delivery_status: status });
            toast.success(`Delivery status updated to "${status}" for ${selectedIds.size} sale(s).`);
            setDeliveryDropdown(false);
            tableRefresh.current?.();
        } catch { toast.error('Failed to update delivery status.'); }
    }

    async function handleReviewEmail() {
        try {
            const res = await axios.post('/admin/sales/bulk-review-email', { ids: [...selectedIds] });
            toast.success(`Review email sent to ${res.data.sent} customer(s).`);
        } catch { toast.error('Failed to send review emails.'); }
    }

    async function handleReviewWhatsApp() {
        try {
            const res = await axios.post('/admin/sales/bulk-review-whatsapp', { ids: [...selectedIds] });
            toast.success(`Review WhatsApp sent to ${res.data.sent} customer(s).`);
        } catch { toast.error('Failed to send WhatsApp messages.'); }
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
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print ({selectedIds.size})
                                </button>

                                {/* Payment Status Dropdown */}
                                <div className="relative" ref={paymentRef}>
                                    <button
                                        onClick={() => { setPaymentDropdown(o => !o); setDeliveryDropdown(false); }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Payment ({selectedIds.size})
                                    </button>
                                    {paymentDropdown && (
                                        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[180px] overflow-hidden">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                                Set Payment Status
                                            </div>
                                            {[
                                                { value: 'paid',           label: 'Paid',           color: 'text-green-600' },
                                                { value: 'unpaid',         label: 'Unpaid',         color: 'text-red-600' },
                                                { value: 'partially_paid', label: 'Partially Paid', color: 'text-yellow-600' },
                                                { value: 'refunded',       label: 'Refunded',       color: 'text-gray-600' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleBulkPayment(opt.value)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium ${opt.color}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Status Dropdown */}
                                <div className="relative" ref={deliveryRef}>
                                    <button
                                        onClick={() => { setDeliveryDropdown(o => !o); setPaymentDropdown(false); }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-md"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Delivery ({selectedIds.size})
                                    </button>
                                    {deliveryDropdown && (
                                        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[180px] overflow-hidden">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                                Set Delivery Status
                                            </div>
                                            {[
                                                { value: 'pending',    label: 'Pending',    color: 'text-yellow-600' },
                                                { value: 'processing', label: 'Processing', color: 'text-blue-600' },
                                                { value: 'shipped',    label: 'Shipped',    color: 'text-purple-600' },
                                                { value: 'delivered',  label: 'Delivered',  color: 'text-green-600' },
                                                { value: 'cancelled',  label: 'Cancelled',  color: 'text-red-600' },
                                                { value: 'returned',   label: 'Returned',   color: 'text-gray-600' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleBulkDelivery(opt.value)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium ${opt.color}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Review buttons */}
                                <button
                                    onClick={handleReviewWhatsApp}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-md"
                                    title="Send review request via WhatsApp"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <Star className="w-3.5 h-3.5" />
                                    Review WA
                                </button>
                                <button
                                    onClick={handleReviewEmail}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all shadow-md"
                                    title="Send review request via Email"
                                >
                                    <Mail className="w-4 h-4" />
                                    <Star className="w-3.5 h-3.5" />
                                    Review Email
                                </button>
                            </>
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
                        refreshRef={tableRefresh}
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
