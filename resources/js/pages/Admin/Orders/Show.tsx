import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, User, Package, MapPin, CreditCard, FileText, Truck, Calendar } from 'lucide-react';
import { PAYMENT_METHOD_OPTIONS, SHIPPING_METHOD_OPTIONS } from '@/constants/orderOptions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Details', href: '#' },
];

function getOptionLabel(options: readonly { value: string; label: string }[], value: string | null): string {
    if (!value) return '—';
    return options.find(o => o.value === value)?.label ?? value;
}

function cap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface OrderItem {
    id: number;
    product_id: number;
    product_variant_id: number | null;
    quantity: number;
    price: number;
    cost_price: number;
    discount: number;
    subtotal: number;
    meta: {
        product_name: string;
        sku: string;
        variant_name?: string;
        cost_price?: number;
    };
    product?: { id: number; name: string; sku: string };
    variant?: { id: number; name: string };
}

interface Order {
    id: number;
    customer_id: number;
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
    payment_date: string | null;
    shipping_method: string | null;
    shipping_address: string | null;
    billing_address: string | null;
    order_note: string | null;
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
        email: string | null;
    };
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

const statusColors: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded:   'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const paymentColors: Record<string, string> = {
    paid:           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    unpaid:         'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    refunded:       'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

/** Compact label + value row used throughout the right-column cards */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-2 py-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white text-right">{value}</span>
        </div>
    );
}

/** Thin card shell used in the right column */
function MiniCard({ icon: Icon, title, children }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    );
}

export default function Show({ order }: { order: Order }) {
    const totalProfit = order.items.reduce((sum, item) => {
        const cp = item.cost_price ?? item.meta?.cost_price ?? 0;
        return sum + ((item.price - cp) * item.quantity - item.discount);
    }, 0) - Number(order.invoice_discount);

    const sameAddress =
        order.shipping_address &&
        order.billing_address &&
        order.shipping_address.trim() === order.billing_address.trim();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order: ${order.order_number}`} />

            <div className="p-3 space-y-3">

                {/* ── Top bar ──────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm px-3 py-2">
                    {/* Back */}
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-7 h-7 shrink-0"
                        title="Back to orders"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    {/* Order number */}
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{order.order_number}</span>

                    {/* Status badges */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {cap(order.status)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors[order.payment_status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {cap(order.payment_status.replace('_', ' '))}
                    </span>

                    {/* Date */}
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleString()}
                    </span>

                    {/* Grand total */}
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-1">
                        PKR {order.grand_total.toFixed(2)}
                    </span>

                    {/* Profit chip */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${totalProfit >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        Profit: {totalProfit >= 0 ? '+' : ''}PKR {totalProfit.toFixed(2)}
                    </span>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Edit action */}
                    <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                    </Link>
                </div>

                {/* ── Main 2-column layout ─────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 items-start">

                    {/* ── LEFT — Items + Totals ─────────────────────────── */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Package className="w-4 h-4 text-blue-500" />
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order Items</h2>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Product</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cost</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qty</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Disc.</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subtotal</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {order.items.map((item) => {
                                        const cp = item.cost_price ?? item.meta?.cost_price ?? 0;
                                        const profit = (item.price - cp) * item.quantity - item.discount;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                <td className="px-3 py-2">
                                                    <div className="font-medium text-gray-900 dark:text-white leading-tight">
                                                        {item.meta.product_name}
                                                    </div>
                                                    <div className="text-gray-400 dark:text-gray-500 text-[11px]">
                                                        SKU: {item.meta.sku}
                                                        {item.meta.variant_name && ` · ${item.meta.variant_name}`}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right text-gray-400 dark:text-gray-500">
                                                    {Number(cp).toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                                                    {item.price.toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-medium">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-3 py-2 text-right text-red-500 dark:text-red-400">
                                                    -{item.discount.toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                                    {item.subtotal.toFixed(2)}
                                                </td>
                                                <td className={`px-3 py-2 text-right font-semibold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-end">
                                <div className="w-64 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-white">PKR {order.subtotal.toFixed(2)}</span>
                                    </div>
                                    {Number(order.product_discount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Product Discount</span>
                                            <span className="font-medium text-red-500">- PKR {order.product_discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {Number(order.invoice_discount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Invoice Discount</span>
                                            <span className="font-medium text-red-500">- PKR {order.invoice_discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                                        <span className="font-medium text-gray-900 dark:text-white">+ PKR {order.shipping_charges.toFixed(2)}</span>
                                    </div>
                                    {Number(order.tax) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Tax</span>
                                            <span className="font-medium text-gray-900 dark:text-white">+ PKR {order.tax.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold border-t border-gray-300 dark:border-gray-600 pt-1.5 mt-1">
                                        <span className="text-gray-900 dark:text-white">Grand Total</span>
                                        <span className="text-blue-600 dark:text-blue-400">PKR {order.grand_total.toFixed(2)}</span>
                                    </div>
                                    <div className={`flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-1 ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        <span>Net Profit</span>
                                        <span>{totalProfit >= 0 ? '+' : ''}PKR {totalProfit.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT — Compact info cards ────────────────────── */}
                    <div className="space-y-2.5">

                        {/* Customer */}
                        <MiniCard icon={User} title="Customer">
                            <InfoRow label="Name" value={`${order.customer.first_name} ${order.customer.last_name}`} />
                            <InfoRow label="Phone" value={order.customer.phone} />
                            {order.customer.email && (
                                <InfoRow label="Email" value={order.customer.email} />
                            )}
                            <InfoRow
                                label="Created"
                                value={
                                    <span className="flex items-center gap-1 justify-end text-gray-400 dark:text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                }
                            />
                        </MiniCard>

                        {/* Address — merged or split */}
                        <MiniCard icon={MapPin} title={sameAddress ? 'Shipping & Billing Address' : 'Addresses'}>
                            {order.shipping_address && (
                                <div className="mb-1">
                                    {!sameAddress && (
                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-0.5">Shipping</div>
                                    )}
                                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                        {order.shipping_address}
                                    </p>
                                </div>
                            )}
                            {!sameAddress && order.billing_address && (
                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-0.5">Billing</div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                        {order.billing_address}
                                    </p>
                                </div>
                            )}
                            {!order.shipping_address && !order.billing_address && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">No address provided</p>
                            )}
                        </MiniCard>

                        {/* Payment + Shipping combined */}
                        <MiniCard icon={CreditCard} title="Payment & Shipping">
                            <InfoRow
                                label="Payment"
                                value={
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${paymentColors[order.payment_status] ?? ''}`}>
                                        {cap(order.payment_status.replace('_', ' '))}
                                    </span>
                                }
                            />
                            {order.payment_method && (
                                <InfoRow label="Method" value={getOptionLabel(PAYMENT_METHOD_OPTIONS, order.payment_method)} />
                            )}
                            {order.payment_date && (
                                <InfoRow label="Paid on" value={new Date(order.payment_date).toLocaleDateString()} />
                            )}
                            {order.shipping_method && (
                                <>
                                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                                    <InfoRow label="Courier" value={getOptionLabel(SHIPPING_METHOD_OPTIONS, order.shipping_method)} />
                                </>
                            )}
                            <InfoRow label="Charges" value={`PKR ${order.shipping_charges.toFixed(2)}`} />
                        </MiniCard>

                        {/* Order Note — only if present */}
                        {order.order_note && (
                            <MiniCard icon={FileText} title="Order Note">
                                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {order.order_note}
                                </p>
                            </MiniCard>
                        )}

                        {/* Truck / Status summary — optional extra context */}
                        <MiniCard icon={Truck} title="Timeline">
                            <InfoRow
                                label="Status"
                                value={
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] ?? ''}`}>
                                        {cap(order.status)}
                                    </span>
                                }
                            />
                            <InfoRow label="Placed" value={new Date(order.created_at).toLocaleString()} />
                            <InfoRow label="Updated" value={new Date(order.updated_at).toLocaleString()} />
                        </MiniCard>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
