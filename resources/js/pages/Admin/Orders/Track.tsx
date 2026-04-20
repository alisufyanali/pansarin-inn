import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle, Circle, Clock, MapPin, Package,
    Search, ShoppingBag, Truck, XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shop', href: '#' },
    { title: 'Track Orders', href: '/admin/orders/track' },
];

// ── Types ──────────────────────────────────────────────────────────────────
interface OrderItem {
    id: number;
    product_name: string;
    variant_label: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface TrackedOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    subtotal: number;
    shipping_charges: number;
    product_discount: number;
    invoice_discount: number;
    tax: number;
    grand_total: number;
    order_note: string | null;
    shipping_address: string | null;
    shipping_method: string | null;
    created_at: string;
    customer: { id: number; name: string; email: string; phone: string | null } | null;
    city: { id: number; name: string } | null;
    items: OrderItem[];
}

interface Props {
    order?: TrackedOrder | null;
    error?: string | null;
    searched?: boolean;
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
    processing: { label: 'Processing', color: 'text-blue-700',   bg: 'bg-blue-100 dark:bg-blue-900/30',   icon: Package },
    shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Truck },
    delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100 dark:bg-green-900/30',  icon: CheckCircle },
    cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100 dark:bg-red-900/30',      icon: XCircle },
    refunded:   { label: 'Refunded',   color: 'text-gray-700',   bg: 'bg-gray-100 dark:bg-gray-800',       icon: XCircle },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
    paid:           { label: 'Paid',           color: 'text-green-700 bg-green-100 dark:bg-green-900/30' },
    unpaid:         { label: 'Unpaid',         color: 'text-red-700 bg-red-100 dark:bg-red-900/30' },
    partially_paid: { label: 'Partially Paid', color: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30' },
    refunded:       { label: 'Refunded',       color: 'text-gray-700 bg-gray-100 dark:bg-gray-800' },
};

const fmt = (n: number) => `Rs. ${Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ── Component ──────────────────────────────────────────────────────────────
export default function Track({ order, error, searched }: Props) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        router.get('/admin/orders/track', { order_number: query.trim() }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const currentStatus = order?.status ?? '';
    const statusCfg     = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG['pending'];
    const StatusIcon    = statusCfg.icon;
    const isCancelled   = ['cancelled', 'refunded'].includes(currentStatus);
    const currentStep   = STATUS_STEPS.indexOf(currentStatus);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Track Orders" />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Track Order</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Enter an order number to view full tracking details</p>
                </div>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g. ORD-20260420-AB12"
                            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <button type="submit" disabled={loading}
                        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Searching...' : 'Track'}
                    </button>
                </form>

                {/* Error */}
                {searched && error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Order found */}
                {order && (
                    <div className="space-y-6">
                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order Number</p>
                                <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                                <p className="mt-1 text-sm text-gray-500">{fmtDate(order.created_at)}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {statusCfg.label}
                                </span>
                                {order.payment_status && (
                                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${PAYMENT_CONFIG[order.payment_status]?.color ?? 'bg-gray-100 text-gray-700'}`}>
                                        {PAYMENT_CONFIG[order.payment_status]?.label ?? order.payment_status}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status timeline */}
                        {!isCancelled && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Order Progress</h2>
                                <div className="relative flex items-center justify-between">
                                    {/* Progress bar */}
                                    <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 dark:bg-gray-700">
                                        <div className="h-full bg-blue-600 transition-all duration-500"
                                            style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />
                                    </div>

                                    {STATUS_STEPS.map((step, i) => {
                                        const cfg      = STATUS_CONFIG[step];
                                        const done     = i <= currentStep;
                                        const active   = i === currentStep;
                                        const StepIcon = cfg.icon;
                                        return (
                                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                                    done
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                                                } ${active ? 'ring-4 ring-blue-100 dark:ring-blue-900/30' : ''}`}>
                                                    {done ? <StepIcon className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                </div>
                                                <span className={`text-xs font-medium ${done ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Cancelled banner */}
                        {isCancelled && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                                <p className="font-medium text-red-700 dark:text-red-400">
                                    This order has been {statusCfg.label.toLowerCase()}.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Customer info */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <ShoppingBag className="h-5 w-5 text-blue-500" /> Customer
                                </h2>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Name</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.name ?? '—'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Email</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.email ?? '—'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Phone</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.phone ?? '—'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Payment</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.payment_method ?? '—'}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Shipping info */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <MapPin className="h-5 w-5 text-emerald-500" /> Shipping
                                </h2>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">City</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.city?.name ?? '—'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Method</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{order.shipping_method ?? '—'}</dd>
                                    </div>
                                    {order.shipping_address && (
                                        <div>
                                            <dt className="mb-1 text-gray-500">Address</dt>
                                            <dd className="font-medium text-gray-900 dark:text-gray-100">{order.shipping_address}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        {/* Order items */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    <Package className="h-5 w-5 text-purple-500" /> Items ({order.items.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.product_name}</p>
                                            {item.variant_label && (
                                                <p className="text-xs text-gray-500">{item.variant_label}</p>
                                            )}
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-gray-500">x{item.quantity} × {fmt(item.unit_price)}</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{fmt(item.subtotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <dt>Subtotal</dt><dd>{fmt(order.subtotal)}</dd>
                                    </div>
                                    {order.product_discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <dt>Product Discount</dt><dd>- {fmt(order.product_discount)}</dd>
                                        </div>
                                    )}
                                    {order.invoice_discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <dt>Invoice Discount</dt><dd>- {fmt(order.invoice_discount)}</dd>
                                        </div>
                                    )}
                                    {order.shipping_charges > 0 && (
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <dt>Shipping</dt><dd>{fmt(order.shipping_charges)}</dd>
                                        </div>
                                    )}
                                    {order.tax > 0 && (
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <dt>Tax</dt><dd>{fmt(order.tax)}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                                        <dt>Grand Total</dt><dd>{fmt(order.grand_total)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Order note */}
                        {order.order_note && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Order Note</p>
                                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{order.order_note}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!searched && !order && (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-700">
                        <Truck className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Enter an order number above to track</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
