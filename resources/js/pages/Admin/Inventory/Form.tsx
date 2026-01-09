import { Link, useForm } from '@inertiajs/react';
import { Package, TrendingDown, TrendingUp, Weight, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';


type Product = {
    id: number;
    name: string;
    sku: string;
    stock_qty: number;
    stock_alert: number;
    price: number;
    unit?: string;
    attribute_values?: Array<{
        id: number;
        attribute_id: number;
        value: string;
        attribute?: {
            id: number;
            name: string;
        };
    }>;
};  

export type InventoryFormData = {
    product_id: string | number;
    quantity: string | number;
    type: 'in' | 'out';
    reference: string;
    note: string;
};

interface InventoryFormProps {
    inventory?: Omit<InventoryFormData, 'quantity'> & {
        id?: number;
        quantity: number;
    };
    products: Product[];
    isEdit?: boolean;
}

export default function InventoryForm({
    inventory,
    products = [],
    isEdit = false,
}: InventoryFormProps) {
    const { data, setData, errors, post, put, processing } =
        useForm<InventoryFormData>({
            product_id: inventory?.product_id || '',
            quantity: inventory?.quantity ? Math.abs(inventory.quantity) : '',
            type: inventory?.type || 'in',
            reference: inventory?.reference || '',
            note: inventory?.note || '',
        });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (data.product_id && products.length > 0) {
            const product = products.find((p) => p.id === Number(data.product_id));
            setSelectedProduct(product || null);
        } else {
            setSelectedProduct(null);
        }
    }, [data.product_id, products]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!data.product_id) {
            alert('Please select a product!');
            return;
        }
        
        if (!data.quantity || Number(data.quantity) <= 0) {
            alert('Quantity must be greater than 0!');
            return;
        }

        if (data.type === 'out' && selectedProduct) {
            if (Number(data.quantity) > selectedProduct.stock_qty) {
                alert(`Insufficient stock! Available: ${selectedProduct.stock_qty} ${selectedProduct.unit || 'units'}`);
                return;
            }
        }

        const url = isEdit ? `/admin/inventory/${inventory?.id}` : '/admin/inventory';
        const method = isEdit ? put : post;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by flash message
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            }
        });
    }

    const isLowStock = selectedProduct
        ? selectedProduct.stock_qty <= selectedProduct.stock_alert && selectedProduct.stock_qty > 0
        : false;
    const isOutOfStock = selectedProduct ? selectedProduct.stock_qty <= 0 : false;

    return (
        <div className="p-3">
            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/admin/inventory"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    title="Back"
                >
                    ←
                </Link>
            </div>

            <div className="mx-auto max-w-4xl py-6">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Inventory Entry' : 'Add Stock Entry'}
                </h2>

                <form onSubmit={submit} className="space-y-6">
                    {/* Product Selection Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                            <Package className="h-5 w-5" />
                            Product Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Product *
                                </label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    required
                                    disabled={isEdit}
                                >
                                    <option value="">-- Select Product --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) {p.unit && `[${p.unit}]`} - Stock: {p.stock_qty}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && (
                                    <div className="mt-1 text-sm text-red-500">{errors.product_id}</div>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className={`rounded-lg border p-4 ${
                                    isOutOfStock
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        : isLowStock
                                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                                        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <Package className={`mt-0.5 h-5 w-5 ${
                                            isOutOfStock
                                                ? 'text-red-600 dark:text-red-400'
                                                : isLowStock
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                        }`} />
                                        <div className="flex-1 space-y-2">
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">SKU</p>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {selectedProduct.sku}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        Rs. {selectedProduct.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Current Stock</p>
                                                    <p className={`font-bold ${
                                                        isOutOfStock
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : isLowStock
                                                            ? 'text-yellow-600 dark:text-yellow-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {selectedProduct.stock_qty} {selectedProduct.unit || 'units'}
                                                    </p>
                                                </div>
                                                {selectedProduct.unit && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            Unit/Packing
                                                        </p>
                                                        <p className="flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100">
                                                            <Weight className="h-3 w-3" />
                                                            {selectedProduct.unit}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {isOutOfStock && (
                                                <div className="mt-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Out of Stock!</span>
                                                </div>
                                            )}
                                            {isLowStock && !isOutOfStock && (
                                                <div className="mt-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Low Stock Warning!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stock Entry Details */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                            Stock Entry Details
                        </h3>

                        <div className="space-y-4">
                            {/* Type */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Transaction Type *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'in')}
                                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition ${
                                            data.type === 'in'
                                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-semibold">Stock In</p>
                                            <p className="text-xs opacity-75">Add inventory</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'out')}
                                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition ${
                                            data.type === 'out'
                                                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                        }`}
                                    >
                                        <TrendingDown className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-semibold">Stock Out</p>
                                            <p className="text-xs opacity-75">Remove inventory</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Quantity {selectedProduct?.unit && `(in ${selectedProduct.unit})`} *
                                </label>
                                <div className="relative mt-1">
                                    <input
    type="number"
    step="0.01"
    value={data.quantity}
    onChange={(e) => setData('quantity', e.target.value)}
    className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800"
    placeholder="0.00"
    required
/>
{errors.quantity && <div className="text-red-500 text-sm">{errors.quantity}</div>}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-gray-400">
                                        {selectedProduct?.unit || 'Units'}
                                    </div>
                                </div>
                                {errors.quantity && (
                                    <div className="mt-1 text-sm text-red-500">{errors.quantity}</div>
                                )}

                                {data.type === 'out' && selectedProduct && data.quantity && (
                                    <div className="mt-2">
                                        {Number(data.quantity) > selectedProduct.stock_qty ? (
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    Insufficient stock! Available: {selectedProduct.stock_qty} {selectedProduct.unit || 'units'}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Remaining: {selectedProduct.stock_qty - Number(data.quantity)} {selectedProduct.unit || 'units'}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {data.type === 'in' && selectedProduct && data.quantity && (
                                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                        New stock: {selectedProduct.stock_qty + Number(data.quantity)} {selectedProduct.unit || 'units'}
                                    </p>
                                )}
                            </div>

                            {/* Reference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reference / Invoice #
                                </label>
                                <input
                                    type="text"
                                    placeholder="PO-123, INV-456, etc."
                                    value={data.reference}
                                    onChange={(e) => setData('reference', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Note
                                </label>
                                <textarea
                                    placeholder="Additional details..."
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/inventory"
                            className="rounded-md bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-blue-600 px-8 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Update Stock' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}