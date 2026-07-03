import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    PAYMENT_METHOD_OPTIONS,
    SHIPPING_METHOD_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    DELIVERY_STATUS_OPTIONS,
    COURIERS_WITH_WEIGHT,
} from '@/constants/orderOptions';

// ── Types ──────────────────────────────────────────────────────────────────

type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
};

type Variant = {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
};

type Product = {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    unit?: string;
    variants?: Variant[];
};

type OrderItem = {
    product_id: number;
    product_variant_id: number | null;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
    product_name: string;
    variant_name: string | null;
    sku: string;
};

type PrefilledOrder = {
    id: number;
    order_number: string;
    customer_id: number;
    shipping_address: string | null;
    billing_address: string | null;
    shipping_method: string | null;
    courier_weight: string | number | null;
    payment_method: string | null;
    payment_status: string | null;
    shipping_charges: number;
    invoice_discount: number;
    grand_total: number;
    customer: Customer | null;
    items: OrderItem[];
};

type SaleItem = {
    product_id: number | string;
    product_variant_id: number | string;
    quantity: number;
    price: number;
    discount: number;
};

type SaleFormData = {
    order_id: string | number;
    customer_id: string | number;
    items: SaleItem[];
    invoice_discount: string | number;
    vat: string | number;
    vat_percent: string;
    shipping_charges: string | number;
    delivery_status: string;
    payment_status: string;
    payment_type: string;
    payment_timestamp: string;
    shipping_method: string;
    courier_weight: string | number;
    shipping_address: string;
    shipping_response: string;
    delivery_datetime: string;
    remarks: string;
    review: string;
};

interface SaleFormProps {
    sale?: any;
    customers?: Customer[];
    products?: Product[];
    order?: PrefilledOrder | null;
    isEdit?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const INPUT = "w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition";
const INPUT_DISABLED = "w-full px-3 py-2 text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
const SELECT = "w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition";
const LABEL = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1";

// Maps Order payment_method → Sale payment_type values
function mapPaymentMethod(method: string | null): string {
    if (!method) return '';
    const m = method.toLowerCase().replace(/\s+/g, '_');
    if (m.includes('cash') || m.includes('cod'))    return 'cash_on_delivery';
    if (m.includes('bank') || m.includes('transfer')) return 'bank_transfer';
    if (m.includes('card'))                          return 'card_payment';
    return '';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SaleForm({
    sale,
    customers = [],
    products = [],
    order = null,
    isEdit = false,
}: SaleFormProps) {

    // Build initial items from prefilled order or edit data
    const initialItems: SaleItem[] = useMemo(() => {
        if (isEdit && sale?.items?.length) {
            return sale.items.map((i: any) => ({
                product_id: i.product_id,
                product_variant_id: i.product_variant_id ?? '',
                quantity: i.quantity,
                price: i.price,
                discount: i.discount ?? 0,
            }));
        }
        if (order?.items?.length) {
            return order.items.map(i => ({
                product_id: i.product_id,
                product_variant_id: i.product_variant_id ?? '',
                quantity: i.quantity,
                price: i.price,
                discount: i.discount ?? 0,
            }));
        }
        return [{ product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 }];
    }, []);

    const { data, setData, errors, post, put, processing } = useForm<SaleFormData>({
        order_id:          sale?.order_id          ?? order?.id              ?? '',
        customer_id:       sale?.customer_id        ?? order?.customer_id    ?? '',
        items:             initialItems,
        invoice_discount:  sale?.invoice_discount   ?? order?.invoice_discount ?? 0,
        vat:               sale?.vat                ?? 0,
        vat_percent:       sale?.vat_percent        ?? '',
        shipping_charges:  sale?.shipping_charges   ?? order?.shipping_charges ?? 0,
        delivery_status:   sale?.delivery_status    ?? 'pending',
        payment_status:    sale?.payment_status     ?? order?.payment_status   ?? 'unpaid',
        payment_type:      sale?.payment_type       ?? (order?.payment_method ? mapPaymentMethod(order.payment_method) : ''),
        payment_timestamp: sale?.payment_timestamp  ?? '',
        shipping_method:   sale?.shipping_method    ?? order?.shipping_method  ?? '',
        courier_weight:    sale?.courier_weight     ?? order?.courier_weight   ?? '',
        shipping_address:  sale?.shipping_address   ?? order?.shipping_address ?? '',
        shipping_response: sale?.shipping_response  ?? '',
        delivery_datetime: sale?.delivery_datetime  ?? '',
        remarks:           sale?.remarks            ?? '',
        review:            sale?.review             ?? '',
    });

    // Track selected product objects for variant lookup
    const [selectedProducts, setSelectedProducts] = useState<Record<number, Product>>(() => {
        const map: Record<number, Product> = {};
        initialItems.forEach((item, idx) => {
            if (item.product_id) {
                const p = products.find(p => p.id === Number(item.product_id));
                if (p) map[idx] = p;
            }
        });
        return map;
    });

    // Customer derived from order or customers list
    const customer = useMemo(() => {
        if (order?.customer) return order.customer;
        return customers.find(c => c.id === Number(data.customer_id)) ?? null;
    }, [order, customers, data.customer_id]);

    // ── Totals ───────────────────────────────────────────────────────────────
    const subtotal = data.items.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity), 0
    );
    const productDiscount = data.items.reduce(
        (sum, i) => sum + Number(i.discount), 0
    );
    const grandTotal =
        subtotal
        - productDiscount
        - Number(data.invoice_discount)
        + Number(data.vat)
        + Number(data.shipping_charges);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const updateItem = (index: number, field: keyof SaleItem, value: any) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    };

    const handleProductChange = (index: number, productId: string) => {
        const p = products.find(p => p.id === Number(productId));
        setSelectedProducts(prev => p ? { ...prev, [index]: p } : prev);
        const items = [...data.items];
        items[index] = {
            ...items[index],
            product_id: productId,
            product_variant_id: '',
            price: p?.price ?? 0,
        };
        setData('items', items);
    };

    const handleVariantChange = (index: number, variantId: string) => {
        const p = selectedProducts[index];
        const v = p?.variants?.find(v => v.id === Number(variantId));
        const items = [...data.items];
        items[index] = {
            ...items[index],
            product_variant_id: variantId,
            price: v ? v.price : (p?.price ?? 0),
        };
        setData('items', items);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
        setSelectedProducts(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && sale?.id) {
            put(`/admin/sales/${sale.id}`);
        } else {
            post('/admin/sales');
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="p-3">
            {/* Back Button */}
            <div className="flex items-center gap-3 mb-5">
                <Link
                    href="/admin/sales"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-9 h-9 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? `Edit Sale — ${sale?.sale_code}` : 'Create New Sale'}
                    </h1>
                    {order && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            From Order: <span className="font-semibold text-blue-600 dark:text-blue-400">{order.order_number}</span>
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">

                {/* ── Row 1: Customer Info + Payment/Shipping ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Customer Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL}>First Name</label>
                                <input className={INPUT_DISABLED} value={customer?.first_name ?? '—'} disabled />
                            </div>
                            <div>
                                <label className={LABEL}>Last Name</label>
                                <input className={INPUT_DISABLED} value={customer?.last_name ?? '—'} disabled />
                            </div>
                            <div>
                                <label className={LABEL}>Phone</label>
                                <input className={INPUT_DISABLED} value={customer?.phone ?? '—'} disabled />
                            </div>
                            <div>
                                <label className={LABEL}>Email</label>
                                <input className={INPUT_DISABLED} value={customer?.email ?? '—'} disabled />
                            </div>
                        </div>

                        {/* Customer select — only if no order and no edit */}
                        {!order && !isEdit && (
                            <div className="mt-3">
                                <label className={LABEL}>Select Customer *</label>
                                <select
                                    className={SELECT}
                                    value={data.customer_id}
                                    onChange={e => setData('customer_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.first_name} {c.last_name} — {c.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="mt-1 text-xs text-red-500">{errors.customer_id}</p>}
                            </div>
                        )}
                    </div>

                    {/* Payment + Shipping Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                            Payment & Shipping
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL}>Payment Status *</label>
                                <select className={SELECT} value={data.payment_status} onChange={e => setData('payment_status', e.target.value)}>
                                    {PAYMENT_STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LABEL}>Payment Type</label>
                                <select className={SELECT} value={data.payment_type} onChange={e => setData('payment_type', e.target.value)}>
                                    <option value="">Select</option>
                                    {PAYMENT_METHOD_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LABEL}>Delivery Status *</label>
                                <select className={SELECT} value={data.delivery_status} onChange={e => setData('delivery_status', e.target.value)}>
                                    {DELIVERY_STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LABEL}>Shipping Method</label>
                                <select className={SELECT} value={data.shipping_method} onChange={e => setData('shipping_method', e.target.value)}>
                                    <option value="">Select</option>
                                    {SHIPPING_METHOD_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {COURIERS_WITH_WEIGHT.includes(data.shipping_method as any) && (
                                    <div className="mt-2">
                                        <label className={LABEL}>Courier Weight (kg)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            className={INPUT}
                                            value={data.courier_weight}
                                            onChange={e => setData('courier_weight', e.target.value)}
                                            placeholder="0.5"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className={LABEL}>Payment Date</label>
                                <input
                                    type="datetime-local"
                                    className={INPUT}
                                    value={data.payment_timestamp}
                                    onChange={e => setData('payment_timestamp', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className={LABEL}>Delivery Date</label>
                                <input
                                    type="datetime-local"
                                    className={INPUT}
                                    value={data.delivery_datetime}
                                    onChange={e => setData('delivery_datetime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Shipping Address ── */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                    <textarea
                        rows={2}
                        className={INPUT}
                        value={data.shipping_address}
                        onChange={e => setData('shipping_address', e.target.value)}
                        placeholder="Enter shipping address..."
                    />
                </div>

                {/* ── Items Table ── */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-4 h-4" /> Sale Items
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                                <tr>
                                    <th className="px-3 py-2.5 text-left font-semibold w-64">Product</th>
                                    <th className="px-3 py-2.5 text-left font-semibold w-40">Variant</th>
                                    <th className="px-3 py-2.5 text-center font-semibold w-20">Qty</th>
                                    <th className="px-3 py-2.5 text-right font-semibold w-28">Price</th>
                                    <th className="px-3 py-2.5 text-right font-semibold w-28">Discount</th>
                                    <th className="px-3 py-2.5 text-right font-semibold w-28">Subtotal</th>
                                    <th className="px-3 py-2.5 text-center font-semibold w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {data.items.map((item, index) => {
                                    const itemSubtotal = (Number(item.price) * Number(item.quantity)) - Number(item.discount);
                                    const prod = selectedProducts[index];

                                    return (
                                        <tr key={index} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            {/* Product */}
                                            <td className="px-3 py-2">
                                                <select
                                                    className="w-full px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none"
                                                    value={item.product_id}
                                                    onChange={e => handleProductChange(index, e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} {p.sku ? `(${p.sku})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {prod && (
                                                    <span className="text-xs text-gray-400 mt-0.5 block">
                                                        Stock: {prod.stock}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Variant */}
                                            <td className="px-3 py-2">
                                                <select
                                                    className="w-full px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                                                    value={item.product_variant_id}
                                                    onChange={e => handleVariantChange(index, e.target.value)}
                                                    disabled={!prod?.variants?.length}
                                                >
                                                    <option value="">No variant</option>
                                                    {prod?.variants?.map(v => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.name} (Stk: {v.stock})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Qty */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-center"
                                                    required
                                                />
                                            </td>

                                            {/* Price */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                                    required
                                                />
                                            </td>

                                            {/* Discount */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.discount}
                                                    onChange={e => updateItem(index, 'discount', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                                />
                                            </td>

                                            {/* Subtotal */}
                                            <td className="px-3 py-2">
                                                <div className="text-right text-xs font-semibold text-gray-800 dark:text-gray-200 pr-1">
                                                    {itemSubtotal.toFixed(2)}
                                                </div>
                                            </td>

                                            {/* Remove */}
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 disabled:opacity-30 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Remarks */}
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                        <label className={LABEL}>Remarks</label>
                        <textarea
                            rows={2}
                            className={INPUT}
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                            placeholder="Any notes about this sale..."
                        />
                    </div>

                    {/* Totals */}
                    <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-end">
                            <div className="w-72 space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">PKR {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Product Discount:</span>
                                    <span className="text-red-600 dark:text-red-400">− PKR {productDiscount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Invoice Discount:</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.invoice_discount}
                                        onChange={e => setData('invoice_discount', e.target.value)}
                                        className="w-28 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">VAT:</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.vat}
                                        onChange={e => setData('vat', e.target.value)}
                                        className="w-28 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.shipping_charges}
                                        onChange={e => setData('shipping_charges', e.target.value)}
                                        className="w-28 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-600">
                                    <span className="font-bold text-gray-900 dark:text-white text-base">Grand Total:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-base">
                                        PKR {grandTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Validation Errors ── */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Please fix the following errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {Object.values(errors).map((err, i) => (
                                <li key={i} className="text-xs text-red-600 dark:text-red-400">{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Submit ── */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/sales"
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition shadow-sm"
                    >
                        {processing ? 'Saving...' : isEdit ? 'Update Sale' : 'Create Sale'}
                    </button>
                </div>

            </form>
        </div>
    );
}