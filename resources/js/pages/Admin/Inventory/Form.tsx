import { Link, useForm, router } from '@inertiajs/react';
import { Package, AlertCircle, ArrowLeft, Search, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────
type Variant = {
    id: number; sku: string; value: string;
    attributes: Record<string, string>;
    stock_qty: number;
};

type Product = {
    id: number; name: string; sku: string;
    stock_qty: number; stock_alert: number;
    price: number; unit?: string;
    variants?: Variant[];
};

export type InventoryFormData = {
    product_id:         string | number;
    product_variant_id: string | number;
    quantity:           string | number;
    type:               'in' | 'out' | 'adjustment' | 'return';
    cost_price:         string | number;
    reference:          string;
    source:             string;
    note:               string;
    // bulk mode
    variants:           { variant_id: number | null; quantity: string }[];
};

interface InventoryFormProps {
    inventory?: Partial<InventoryFormData> & { id?: number; quantity?: number };
    products:   Product[];
    isEdit?:    boolean;
}

type VariantRow = {
    variant_id:    number | null;
    label:         string;
    sku:           string;
    current_stock: number;
    quantity:      string;
};

const cx = {
    input:  "w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm",
    label:  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5",
    card:   "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6",
    error:  "text-red-500 dark:text-red-400 text-xs mt-1",
};

const TYPE_OPTIONS = [
    { value: 'in',         label: '📥 Stock In',   desc: 'Purchase / receive', bg: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' },
    { value: 'out',        label: '📤 Stock Out',  desc: 'Sale / dispatch',    bg: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700' },
    { value: 'adjustment', label: '⚙️ Adjust',     desc: 'Manual correction',  bg: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700' },
    { value: 'return',     label: '↩️ Return',     desc: 'Customer return',    bg: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700' },
];

const SOURCE_MAP: Record<string, string> = {
    in: 'purchase', out: 'sale', adjustment: 'manual', return: 'return',
};

export default function InventoryForm({ inventory, products = [], isEdit = false }: InventoryFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<InventoryFormData>({
        product_id:         inventory?.product_id         || '',
        product_variant_id: inventory?.product_variant_id || '',
        quantity:           inventory?.quantity ? Math.abs(inventory.quantity) : '',
        type:               inventory?.type               || 'in',
        cost_price:         inventory?.cost_price         || '',
        reference:          inventory?.reference          || '',
        source:             inventory?.source             || 'purchase',
        note:               inventory?.note               || '',
        variants:           [],
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery,     setSearchQuery]     = useState('');
    const [isDropdownOpen,  setIsDropdownOpen]  = useState(false);
    const [variantRows,     setVariantRows]     = useState<VariantRow[]>([]);
    const [fillAllValue,    setFillAllValue]    = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const hasVariants = (selectedProduct?.variants?.length ?? 0) > 0;
    const isBulkMode  = hasVariants && !isEdit;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Init product on edit
    useEffect(() => {
        if (data.product_id && products.length) {
            const p = products.find(p => p.id === Number(data.product_id));
            if (p) selectProduct(p, false); // false = don't reset variant on edit
        }
    }, [products]);

    // Auto-set source on type change
    useEffect(() => {
        if (!inventory?.source) setData('source', SOURCE_MAP[data.type] || 'manual');
    }, [data.type]);

    // Build variant rows when product changes
    function selectProduct(p: Product, reset = true) {
        setSelectedProduct(p);
        if (reset) {
            setData('product_id', p.id);
            setData('product_variant_id', '');
        }
        setIsDropdownOpen(false);
        setSearchQuery('');

        if ((p.variants?.length ?? 0) > 0) {
            setVariantRows(
                p.variants!.map(v => ({
                    variant_id:    v.id,
                    label:         Object.values(v.attributes ?? {}).join(' / ') || v.value || v.sku,
                    sku:           v.sku,
                    current_stock: v.stock_qty ?? 0,
                    quantity:      '',
                }))
            );
        } else {
            setVariantRows([{
                variant_id:    null,
                label:         p.name,
                sku:           p.sku,
                current_stock: p.stock_qty ?? 0,
                quantity:      '',
            }]);
        }
    }

    function updateRowQty(index: number, value: string) {
        const updated = [...variantRows];
        updated[index].quantity = value;
        setVariantRows(updated);
    }

    function applyFillAll(value: string) {
        setFillAllValue(value);
        setVariantRows(rows => rows.map(r => ({ ...r, quantity: value })));
    }

    function afterQty(row: VariantRow): number {
        const qty = Number(row.quantity) || 0;
        return ['out', 'adjustment'].includes(data.type)
            ? row.current_stock - qty
            : row.current_stock + qty;
    }

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
    });

    // Single-product (no variants) current stock
    const singleStock = selectedProduct?.stock_qty ?? 0;
    const stockAlert  = selectedProduct?.stock_alert ?? 5;
    const isLow       = singleStock <= stockAlert && singleStock > 0;
    const isOut       = singleStock <= 0;

    const activeRows    = variantRows.filter(r => Number(r.quantity) > 0);
    const totalQty      = activeRows.reduce((s, r) => s + Number(r.quantity), 0);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.product_id) { alert('Please select a product!'); return; }

        if (isBulkMode) {
            // Bulk — send variants array
            if (activeRows.length === 0) { alert('Enter quantity for at least one variant!'); return; }
            setData('variants', activeRows.map(r => ({ variant_id: r.variant_id, quantity: r.quantity })));
            setTimeout(() => post('/admin/inventory/bulk-store'), 30);
        } else {
            // Single
            if (!data.quantity || Number(data.quantity) <= 0) { alert('Quantity must be > 0!'); return; }
            if (['out', 'adjustment'].includes(data.type) && Number(data.quantity) > singleStock) {
                alert(`Insufficient stock! Available: ${singleStock}`); return;
            }
            if (isEdit && inventory?.id) put(`/admin/inventory/${inventory.id}`, { preserveScroll: true });
            else post('/admin/inventory', { preserveScroll: true });
        }
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href={'/admin/inventory'}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isEdit ? 'Edit Stock Entry' : 'Add Stock Entry'}
                    </h1>
                    {isBulkMode && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                            Bulk mode — sab variants ek saath
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">

                {/* ── Product Selection ── */}
                <div className={cx.card}>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" /> Product
                    </h3>

                    {isEdit ? (
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                            {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : 'Loading...'}
                        </div>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Search product by name or SKU..."
                                    className={`${cx.input} pl-9 pr-9`} />
                                {searchQuery && (
                                    <button type="button" onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {selectedProduct && !isDropdownOpen && (
                                <div className="mt-2 flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {selectedProduct.name}
                                        <span className="text-gray-500 ml-1">({selectedProduct.sku})</span>
                                        {hasVariants && (
                                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                                {selectedProduct.variants!.length} variants
                                            </span>
                                        )}
                                    </span>
                                    <button type="button" onClick={() => {
                                        setData('product_id', ''); setData('product_variant_id', '');
                                        setSelectedProduct(null); setVariantRows([]); setSearchQuery('');
                                    }} className="text-gray-400 hover:text-red-500">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {isDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                        <button key={p.id} type="button"
                                            onClick={() => selectProduct(p)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition ${data.product_id === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{p.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {p.sku}{p.unit ? ` • ${p.unit}` : ''}
                                                        {(p.variants?.length ?? 0) > 0 && (
                                                            <span className="ml-2 text-indigo-500">{p.variants!.length} variants</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    p.stock_qty <= 0 ? 'bg-red-100 text-red-600' :
                                                    p.stock_qty <= p.stock_alert ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {(p.variants?.length ?? 0) > 0 ? 'Has variants' : `Stock: ${p.stock_qty}`}
                                                </span>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {errors.product_id && <p className={cx.error}>{errors.product_id}</p>}

                    {/* Single product stock info (no variants) */}
                    {selectedProduct && !hasVariants && (
                        <div className={`mt-4 rounded-lg border p-4 ${
                            isOut ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                            isLow ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                                    'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        }`}>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">SKU</p>
                                    <p className="font-semibold">{selectedProduct.sku}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Current Stock</p>
                                    <p className={`font-bold text-lg ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {singleStock} {selectedProduct.unit || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Alert At</p>
                                    <p className="font-semibold">{stockAlert}</p>
                                </div>
                            </div>
                            {(isLow || isOut) && (
                                <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${isOut ? 'text-red-600' : 'text-yellow-600'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                    {isOut ? 'Out of Stock!' : 'Low Stock Warning!'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Transaction Type + Common Fields ── */}
                <div className={cx.card}>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-5">Transaction Details</h3>
                    <div className="space-y-5">

                        {/* Type buttons */}
                        <div>
                            <label className={cx.label}>Transaction Type <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {TYPE_OPTIONS.map(opt => (
                                    <button key={opt.value} type="button"
                                        onClick={() => setData('type', opt.value as any)}
                                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all text-center ${
                                            data.type === opt.value
                                                ? opt.bg + ' ring-2 ring-offset-1 ring-current'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        <span className="text-sm font-semibold">{opt.label}</span>
                                        <span className="text-xs text-gray-500">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reference + Cost Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={cx.label}>Reference / Invoice #</label>
                                <input type="text" placeholder="PO-123, INV-456..."
                                    value={data.reference} onChange={e => setData('reference', e.target.value)}
                                    className={cx.input} />
                                {errors.reference && <p className={cx.error}>{errors.reference}</p>}
                            </div>
                            <div>
                                <label className={cx.label}>Cost Price <span className="text-gray-400">(per unit)</span></label>
                                <input type="number" step="0.01" min="0" placeholder="0.00"
                                    value={data.cost_price} onChange={e => setData('cost_price', e.target.value)}
                                    className={cx.input} />
                                {errors.cost_price && <p className={cx.error}>{errors.cost_price}</p>}
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className={cx.label}>Note</label>
                            <textarea rows={2} placeholder="Additional details..."
                                value={data.note} onChange={e => setData('note', e.target.value)}
                                className={`${cx.input} resize-none`} />
                        </div>
                    </div>
                </div>

                {/* ── BULK: Variant Quantity Table ── */}
                {isBulkMode && variantRows.length > 0 && (
                    <div className={cx.card}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                Variant Quantities
                                <span className="ml-2 text-sm font-normal text-gray-400">
                                    ({variantRows.length} variants)
                                </span>
                            </h3>
                            {/* Fill All */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Fill all:</span>
                                <input type="number" min="0" placeholder="qty"
                                    value={fillAllValue}
                                    onChange={e => applyFillAll(e.target.value)}
                                    className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                                        <th className="px-4 py-3 text-left">Variant</th>
                                        <th className="px-4 py-3 text-left">SKU</th>
                                        <th className="px-4 py-3 text-center">Current</th>
                                        <th className="px-4 py-3 text-center w-36">Quantity</th>
                                        <th className="px-4 py-3 text-center">After</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {variantRows.map((row, i) => {
                                        const qty    = Number(row.quantity) || 0;
                                        const after  = afterQty(row);
                                        const hasQty = qty > 0;
                                        const isNeg  = after < 0;
                                        return (
                                            <tr key={i} className={`transition-colors ${hasQty ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{row.label}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{row.sku}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-semibold ${
                                                        row.current_stock <= 0 ? 'text-red-500' :
                                                        row.current_stock <= 10 ? 'text-yellow-600' : 'text-gray-700 dark:text-gray-300'
                                                    }`}>{row.current_stock}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input type="number" min="0" step="0.01" placeholder="0"
                                                        value={row.quantity}
                                                        onChange={e => updateRowQty(i, e.target.value)}
                                                        className="w-full border rounded-lg px-3 py-1.5 text-center text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                                                    {errors[`variants.${i}.quantity` as any] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`variants.${i}.quantity` as any]}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {hasQty ? (
                                                        <span className={`font-bold text-base ${isNeg ? 'text-red-600' : after <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            {after}
                                                            {isNeg && <span className="block text-xs font-normal">⚠️ Insufficient</span>}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 dark:text-gray-600">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {totalQty > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                            <td className="px-4 py-2" colSpan={3}>
                                                Total ({activeRows.length} of {variantRows.length} variants)
                                            </td>
                                            <td className="px-4 py-2 text-center text-indigo-600 dark:text-indigo-400">
                                                {totalQty} {selectedProduct?.unit || ''}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Variants general error */}
                        {(errors as any).variants && (
                            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-red-600 dark:text-red-400 text-sm">{(errors as any).variants}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SINGLE: Quantity field (no variants) ── */}
                {!isBulkMode && selectedProduct && (
                    <div className={cx.card}>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Quantity</h3>
                        <div>
                            <label className={cx.label}>
                                Quantity <span className="text-red-500">*</span>
                                {selectedProduct?.unit && <span className="text-gray-400 ml-1">({selectedProduct.unit})</span>}
                            </label>
                            <input type="number" step="0.01" min="0" placeholder="0.00"
                                value={data.quantity} onChange={e => setData('quantity', e.target.value)}
                                className={cx.input} />
                            {errors.quantity && <p className={cx.error}>{errors.quantity}</p>}
                            {data.quantity && (
                                <p className={`text-xs mt-1 font-medium ${
                                    ['out','adjustment'].includes(data.type) && Number(data.quantity) > singleStock
                                        ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                    After: {['out','adjustment'].includes(data.type)
                                        ? singleStock - Number(data.quantity)
                                        : singleStock + Number(data.quantity)
                                    } {selectedProduct.unit || ''}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Submit ── */}
                <div className="flex gap-3">
                    <Link href={'/admin/inventory'}
                        className="flex-1 text-center border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2">
                        {processing
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                            : isEdit
                                ? 'Update Entry'
                                : isBulkMode
                                    ? `Save ${activeRows.length > 0 ? `(${activeRows.length} variants)` : 'Bulk Entry'}`
                                    : 'Add Stock'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}