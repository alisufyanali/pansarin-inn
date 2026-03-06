import { Link, useForm } from '@inertiajs/react';
import { Package, TrendingDown, TrendingUp, AlertCircle, ArrowLeft, Search, X, ChevronDown } from 'lucide-react';
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
};

interface InventoryFormProps {
    inventory?: Partial<InventoryFormData> & { id?: number; quantity?: number };
    products:   Product[];
    isEdit?:    boolean;
}

const cx = {
    input:  "w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm",
    label:  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5",
    card:   "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6",
    error:  "text-red-500 dark:text-red-400 text-xs mt-1",
};

export default function InventoryForm({ inventory, products = [], isEdit = false }: InventoryFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<InventoryFormData>({
        product_id:         inventory?.product_id         || '',
        product_variant_id: inventory?.product_variant_id || '',
        quantity:           inventory?.quantity ? Math.abs(inventory.quantity) : '',
        type:               inventory?.type               || 'in',
        cost_price:         inventory?.cost_price         || '',
        reference:          inventory?.reference          || '',
        source:             inventory?.source             || '',
        note:               inventory?.note               || '',
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant,  setSelectedVariant]  = useState<Variant | null>(null);
    const [searchQuery,      setSearchQuery]      = useState('');
    const [isDropdownOpen,   setIsDropdownOpen]   = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Init selected product/variant on edit
    useEffect(() => {
        if (data.product_id && products.length) {
            const p = products.find(p => p.id === Number(data.product_id));
            setSelectedProduct(p || null);
            if (p && data.product_variant_id) {
                const v = p.variants?.find(v => v.id === Number(data.product_variant_id));
                setSelectedVariant(v || null);
            }
        }
    }, [products]);

    // Auto-set source when type changes
    useEffect(() => {
        const defaults: Record<string, string> = { in: 'purchase', out: 'sale', adjustment: 'manual', return: 'return' };
        if (!inventory?.source) setData('source', defaults[data.type] || 'manual');
    }, [data.type]);

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });

    // Current stock — variant stock or product stock
    const currentStock = selectedVariant
        ? (selectedVariant.stock_qty ?? 0)
        : (selectedProduct?.stock_qty ?? 0);

    const stockAlert   = selectedProduct?.stock_alert ?? 5;
    const isLowStock   = currentStock <= stockAlert && currentStock > 0;
    const isOutOfStock = currentStock <= 0;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.product_id)          { alert('Please select a product!'); return; }
        if (!data.quantity || Number(data.quantity) <= 0) { alert('Quantity must be > 0!'); return; }
        if (['out', 'adjustment'].includes(data.type) && Number(data.quantity) > currentStock) {
            alert(`Insufficient stock! Available: ${currentStock}`);
            return;
        }
        if (isEdit && inventory?.id) put(`/admin/inventory/${inventory.id}`, { preserveScroll: true });
        else post('/admin/inventory', { preserveScroll: true });
    }

    const typeOptions = [
        { value: 'in',         label: '📥 Stock In',    desc: 'Purchase / receive',  color: 'green' },
        { value: 'out',        label: '📤 Stock Out',   desc: 'Sale / dispatch',      color: 'red'   },
        { value: 'adjustment', label: '⚙️ Adjustment',  desc: 'Manual correction',    color: 'amber' },
        { value: 'return',     label: '↩️ Return',      desc: 'Customer return',      color: 'blue'  },
    ];

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/inventory"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEdit ? 'Edit Stock Entry' : 'Add Stock Entry'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">

                {/* ── Product Selection ── */}
                <div className={cx.card}>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" /> Product
                    </h3>

                    {isEdit ? (
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
                            {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : 'Loading...'}
                        </div>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            {/* Search box */}
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

                            {/* Selected badge */}
                            {selectedProduct && !isDropdownOpen && (
                                <div className="mt-2 flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {selectedProduct.name} <span className="text-gray-500">({selectedProduct.sku})</span>
                                    </span>
                                    <button type="button" onClick={() => {
                                        setData('product_id', ''); setData('product_variant_id', '');
                                        setSelectedProduct(null); setSelectedVariant(null); setSearchQuery('');
                                    }} className="text-gray-400 hover:text-red-500">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                        <button key={p.id} type="button"
                                            onClick={() => {
                                                setData('product_id', p.id);
                                                setData('product_variant_id', '');
                                                setSelectedProduct(p); setSelectedVariant(null);
                                                setIsDropdownOpen(false); setSearchQuery('');
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition ${data.product_id === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500">{p.sku}{p.unit ? ` • ${p.unit}` : ''}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    p.stock_qty <= 0 ? 'bg-red-100 text-red-600' :
                                                    p.stock_qty <= p.stock_alert ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    Stock: {p.stock_qty}
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

                    {/* Variant selector */}
                    {selectedProduct && (selectedProduct.variants?.length ?? 0) > 0 && (
                        <div className="mt-4">
                            <label className={cx.label}>Select Variant <span className="text-gray-400">(optional)</span></label>
                            <div className="relative">
                                <select value={data.product_variant_id}
                                    onChange={e => {
                                        const vid = e.target.value;
                                        setData('product_variant_id', vid);
                                        const v = selectedProduct.variants?.find(v => v.id === Number(vid));
                                        setSelectedVariant(v || null);
                                    }}
                                    className={`${cx.input} appearance-none pr-9`}>
                                    <option value="">— No variant (product-level) —</option>
                                    {selectedProduct.variants?.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.value} ({v.sku}) — Stock: {v.stock_qty}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Stock info card */}
                    {selectedProduct && (
                        <div className={`mt-4 rounded-lg border p-4 ${
                            isOutOfStock ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                            isLowStock   ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                                           'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        }`}>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">SKU</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedVariant?.sku || selectedProduct.sku}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Current Stock</p>
                                    <p className={`font-bold text-lg ${
                                        isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                        {currentStock} {selectedProduct.unit || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Alert At</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{stockAlert}</p>
                                </div>
                            </div>
                            {(isLowStock || isOutOfStock) && (
                                <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                    {isOutOfStock ? 'Out of Stock!' : 'Low Stock Warning!'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Transaction Details ── */}
                <div className={cx.card}>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-5">Transaction Details</h3>
                    <div className="space-y-5">

                        {/* Type */}
                        <div>
                            <label className={cx.label}>Transaction Type <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {typeOptions.map(opt => (
                                    <button key={opt.value} type="button" onClick={() => setData('type', opt.value as any)}
                                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all text-center ${
                                            data.type === opt.value
                                                ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-${opt.color}-900/20 text-${opt.color}-700 ring-2 ring-${opt.color}-200`
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        <span className="text-sm font-semibold">{opt.label}</span>
                                        <span className="text-xs text-gray-500">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity + Cost Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={cx.label}>
                                    Quantity <span className="text-red-500">*</span>
                                    {selectedProduct?.unit && <span className="text-gray-400 ml-1">({selectedProduct.unit})</span>}
                                </label>
                                <input type="number" step="0.01" min="0" placeholder="0.00"
                                    value={data.quantity} onChange={e => setData('quantity', e.target.value)}
                                    className={cx.input} />
                                {errors.quantity && <p className={cx.error}>{errors.quantity}</p>}

                                {/* Stock preview */}
                                {selectedProduct && data.quantity && (
                                    <p className={`text-xs mt-1 font-medium ${
                                        ['out','adjustment'].includes(data.type) && Number(data.quantity) > currentStock
                                            ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                        {['out','adjustment'].includes(data.type)
                                            ? `After: ${currentStock - Number(data.quantity)} ${selectedProduct.unit || ''}`
                                            : `After: ${currentStock + Number(data.quantity)} ${selectedProduct.unit || ''}`
                                        }
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={cx.label}>Cost Price <span className="text-gray-400">(purchase rate)</span></label>
                                <input type="number" step="0.01" min="0" placeholder="0.00"
                                    value={data.cost_price} onChange={e => setData('cost_price', e.target.value)}
                                    className={cx.input} />
                                {errors.cost_price && <p className={cx.error}>{errors.cost_price}</p>}
                            </div>
                        </div>

                        {/* Reference + Source */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={cx.label}>Reference / Invoice #</label>
                                <input type="text" placeholder="PO-123, INV-456..."
                                    value={data.reference} onChange={e => setData('reference', e.target.value)}
                                    className={cx.input} />
                                {errors.reference && <p className={cx.error}>{errors.reference}</p>}
                            </div>
                            <div>
                                <label className={cx.label}>Source</label>
                                <input type="text" placeholder="purchase, sale, manual..."
                                    value={data.source} onChange={e => setData('source', e.target.value)}
                                    className={cx.input} />
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className={cx.label}>Note</label>
                            <textarea rows={3} placeholder="Additional details..."
                                value={data.note} onChange={e => setData('note', e.target.value)}
                                className={`${cx.input} resize-none`} />
                        </div>
                    </div>
                </div>

                {/* ── Submit ── */}
                <div className="flex gap-3">
                    <Link href="/admin/inventory"
                        className="flex-1 text-center border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2">
                        {processing
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                            : (isEdit ? 'Update Entry' : 'Add Stock')}
                    </button>
                </div>
            </form>
        </div>
    );
}