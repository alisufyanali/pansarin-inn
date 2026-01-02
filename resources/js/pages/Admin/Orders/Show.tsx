import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, User, Package, MapPin, CreditCard, Calendar, FileText, Truck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Details', href: '#' },
];

interface OrderItem {
    id: number;
    product_id: number;
    product_variant_id: number | null;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
    meta: {
        product_name: string;
        sku: string;
        variant_name?: string;
    };
    product?: {
        id: number;
        name: string;
        sku: string;
    };
    variant?: {
        id: number;
        name: string;
    };
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

export default function Show({ order }: { order: Order }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const paymentColors: Record<string, string> = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order: ${order.order_number}`} />

            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>

                    <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl p-8 text-white mb-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{order.order_number}</h1>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                                        {order.payment_status.replace('_', ' ').charAt(0).toUpperCase() + order.payment_status.replace('_', ' ').slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-blue-100 text-sm">Grand Total</div>
                                <div className="text-4xl font-bold">PKR {order.grand_total.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Customer Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {order.customer.first_name} {order.customer.last_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Phone</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{order.customer.phone}</p>
                                </div>
                                {order.customer.email && (
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.customer.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                                    <p className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentColors[order.payment_status]}`}>
                                        {order.payment_status.replace('_', ' ').charAt(0).toUpperCase() + order.payment_status.replace('_', ' ').slice(1)}
                                    </p>
                                </div>
                                {order.payment_method && (
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Method</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.payment_method}</p>
                                    </div>
                                )}
                                {order.payment_date && (
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Date</label>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(order.payment_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Shipping
                            </h2>
                            <div className="space-y-3">
                                {order.shipping_method && (
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Method</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.shipping_method}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Charges</label>
                                    <p className="font-medium text-gray-900 dark:text-white">PKR {order.shipping_charges.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Discount</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {item.meta.product_name}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        SKU: {item.meta.sku}
                                                    </span>
                                                    {item.meta.variant_name && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            Variant: {item.meta.variant_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                                                PKR {item.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-right text-red-600 dark:text-red-400">
                                                - PKR {item.discount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                                                PKR {item.subtotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">PKR {order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Product Discount:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">- PKR {order.product_discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Invoice Discount:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">- PKR {order.invoice_discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">+ PKR {order.shipping_charges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">+ PKR {order.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                                        <span className="text-gray-900 dark:text-white">Grand Total:</span>
                                        <span className="text-blue-600 dark:text-blue-400">PKR {order.grand_total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Shipping Address
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.shipping_address}</p>
                            </div>
                        )}

                        {/* Billing Address */}
                        {order.billing_address && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Billing Address
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.billing_address}</p>
                            </div>
                        )}

                        {/* Order Note */}
                        {order.order_note && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Order Note
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.order_note}</p>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Created At
                                </label>
                                <p className="text-gray-900 dark:text-white font-medium mt-1">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Last Updated
                                </label>
                                <p className="text-gray-900 dark:text-white font-medium mt-1">
                                    {new Date(order.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}