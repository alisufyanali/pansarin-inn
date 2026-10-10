import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Truck, CreditCard, MapPin, Package, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

/** One courier booking attempt (courier_bookings) */
interface CourierBooking {
    id: number;
    courier: string;
    status: 'booked' | 'failed';
    tracking_number: string | null;
    destination_city: string | null;
    message: string | null;
    http_status: number | null;
    response: Record<string, unknown> | null;
    created_at: string;
}

/** Couriers that book online (CourierService); the rest are arranged by hand */
const API_COURIERS: Record<string, string> = { leopard: 'Leopards', px: 'PostEx', movex: 'Movex' };

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
    delivery_status: string;
    payment_status: string;
    payment_type: string | null;
    shipping_method: string | null;
    shipping_address: string | null;
    delivery_datetime: string | null;
    sale_datetime: string;
    remarks: string | null;
    review: string | null;
    customer?: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
        email: string | null;
    };
    order?: {
        id: number;
        order_number: string;
    };
    items?: Array<{
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
            variant_name: string | null;
            custom?: boolean;
        };
        product?: {
            name: string;
            sku: string;
        };
        variant?: {
            name: string;
        };
    }>;
    created_at: string;
    updated_at: string;
    courier_bookings?: CourierBooking[];
}

interface ShowProps {
    sale: Sale;
}

export default function Show({ sale }: ShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error, { duration: 8000 });
    }, [flash]);

    const bookings  = sale.courier_bookings ?? [];
    const booked    = bookings.find(b => b.status === 'booked');
    const latest    = bookings[0];
    const canBook   = !!sale.shipping_method && sale.shipping_method in API_COURIERS && !booked;

    const bookCourier = () => {
        setBooking(true);
        router.post(`/admin/sales/${sale.id}/book-courier`, {}, {
            preserveScroll: true,
            onFinish: () => setBooking(false),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '/admin/sales' },
        { title: sale.sale_code, href: `/admin/sales/${sale.id}` },
    ];

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const paymentColors: Record<string, string> = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sale - ${sale.sale_code}`} />

            <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <Link
                        href="/admin/sales"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>

                    <Link
                        href={`/admin/sales/${sale.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Sale</span>
                    </Link>
                </div>

                <div className="max-w-7xl w-full mx-auto space-y-6">
                    {/* Header Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Sale {sale.sale_code}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Order: {sale.order?.order_number || '-'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Created: {new Date(sale.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[sale.delivery_status]}`}>
                                    {sale.delivery_status.charAt(0).toUpperCase() + sale.delivery_status.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentColors[sale.payment_status]}`}>
                                    {sale.payment_status.replace('_', ' ').charAt(0).toUpperCase() + sale.payment_status.replace('_', ' ').slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Customer Information
                                </h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.customer?.first_name} {sale.customer?.last_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Phone</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.customer?.phone}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.customer?.email || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery & Payment */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Delivery & Payment
                                </h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Shipping Method</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.shipping_method || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Payment Type</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.payment_type || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Delivery Date</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.delivery_datetime ? new Date(sale.delivery_datetime).toLocaleString() : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courier booking — tracking number, or why it failed + retry */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Courier Booking</h2>
                            </div>
                            {canBook && (
                                <button
                                    type="button"
                                    onClick={bookCourier}
                                    disabled={booking}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white transition"
                                >
                                    <RefreshCw className={`w-4 h-4 ${booking ? 'animate-spin' : ''}`} />
                                    {booking ? 'Booking…' : latest ? 'Retry booking' : `Book with ${API_COURIERS[sale.shipping_method!]}`}
                                </button>
                            )}
                        </div>

                        {booked ? (
                            <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                        Booked with {API_COURIERS[booked.courier] ?? booked.courier}
                                        {booked.destination_city && ` → ${booked.destination_city}`}
                                    </p>
                                    <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">{booked.tracking_number}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(booked.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ) : latest ? (
                            <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">Not booked — {API_COURIERS[latest.courier] ?? latest.courier} said:</p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{latest.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">Fix the city or address with <span className="font-medium">Edit Sale</span>, then press <span className="font-medium">Retry booking</span>.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!sale.shipping_method
                                    ? 'No courier chosen for this sale.'
                                    : sale.shipping_method in API_COURIERS
                                        ? 'Not booked yet.'
                                        : 'This courier has no online booking — arrange the parcel by hand.'}
                            </p>
                        )}

                        {bookings.length > 0 && (
                            <details className="mt-4">
                                <summary className="text-xs font-medium text-gray-500 cursor-pointer select-none">
                                    All attempts ({bookings.length}) and the courier's full answers
                                </summary>
                                <div className="mt-2 space-y-2">
                                    {bookings.map(b => (
                                        <div key={b.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full font-semibold ${b.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{API_COURIERS[b.courier] ?? b.courier}</span>
                                                {b.tracking_number && <span className="font-mono">{b.tracking_number}</span>}
                                                {b.http_status && <span className="text-gray-400">HTTP {b.http_status}</span>}
                                                <span className="text-gray-400 ml-auto">{new Date(b.created_at).toLocaleString()}</span>
                                            </div>
                                            {b.message && <p className="mt-1 text-gray-600 dark:text-gray-400">{b.message}</p>}
                                            {b.response && (
                                                <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-50 dark:bg-gray-800 p-2 text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                                                    {JSON.stringify(b.response, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>

                    {/* Shipping Address */}
                    {sale.shipping_address && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Shipping Address
                                </h2>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {sale.shipping_address}
                            </p>
                        </div>
                    )}

                    {/* Sale Items */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Sale Items
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Variant</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Qty</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Price</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Discount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {sale.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {item.meta?.product_name || item.product?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {item.meta?.sku || item.product?.sku || (item.meta?.custom ? 'Custom item' : '-')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {item.meta?.variant_name || item.variant?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                PKR {item.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                                                -{item.discount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                                PKR {item.subtotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-end">
                                <div className="w-80 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">PKR {sale.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Product Discount:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">-PKR {sale.product_discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Invoice Discount:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">-PKR {sale.invoice_discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">VAT {sale.vat_percent ? `(${sale.vat_percent})` : ''}:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">PKR {sale.vat.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">PKR {sale.shipping_charges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-300 dark:border-gray-600">
                                        <span className="text-gray-900 dark:text-white">Grand Total:</span>
                                        <span className="text-gray-900 dark:text-white">PKR {sale.grand_total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks & Review */}
                    {(sale.remarks || sale.review) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {sale.remarks && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Remarks
                                    </h2>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {sale.remarks}
                                    </p>
                                </div>
                            )}
                            {sale.review && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Review
                                    </h2>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {sale.review}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}