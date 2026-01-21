import { Link, useForm } from '@inertiajs/react';
import { Package, TrendingDown, TrendingUp, Weight, AlertCircle, ArrowLeft } from 'lucide-react';
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
    const { data, setData, errors, post, put, processing } = useForm<InventoryFormData>({
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
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/inventory"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Inventory Entry' : 'Add Stock Entry'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Product Selection */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-lg">Product Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Select Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
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
                            {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>}
                        </div>

                        {selectedProduct && (
                            <div className={`rounded-lg border p-4 ${
                                isOutOfStock
                                    ? 'border-red-200 bg-red-50'
                                    : isLowStock
                                    ? 'border-yellow-200 bg-yellow-50'
                                    : 'border-blue-200 bg-blue-50'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <Package className={`mt-0.5 h-5 w-5 ${
                                        isOutOfStock
                                            ? 'text-red-600'
                                            : isLowStock
                                            ? 'text-yellow-600'
                                            : 'text-blue-600'
                                    }`} />
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600">SKU</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedProduct.sku}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Price</p>
                                                <p className="font-semibold text-gray-900">
                                                    Rs. {selectedProduct.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Current Stock</p>
                                                <p className={`font-bold ${
                                                    isOutOfStock
                                                        ? 'text-red-600'
                                                        : isLowStock
                                                        ? 'text-yellow-600'
                                                        : 'text-green-600'
                                                }`}>
                                                    {selectedProduct.stock_qty} {selectedProduct.unit || 'units'}
                                                </p>
                                            </div>
                                            {selectedProduct.unit && (
                                                <div>
                                                    <p className="text-xs text-gray-600">
                                                        Unit/Packing
                                                    </p>
                                                    <p className="flex items-center gap-1 font-semibold text-gray-900">
                                                        <Weight className="h-3 w-3" />
                                                        {selectedProduct.unit}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {(isOutOfStock || isLowStock) && (
                                            <div className={`mt-2 flex items-center gap-2 ${
                                                isOutOfStock ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {isOutOfStock ? 'Out of Stock!' : 'Low Stock Warning!'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stock Entry Details */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="font-semibold text-lg mb-4">Stock Entry Details</h3>

                    <div className="space-y-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Transaction Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'in')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                        data.type === 'in'
                                            ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-semibold">Stock In</p>
                                        <p className="text-xs text-gray-600">Add inventory</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('type', 'out')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                        data.type === 'out'
                                            ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <TrendingDown className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-semibold">Stock Out</p>
                                        <p className="text-xs text-gray-600">Remove inventory</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Quantity <span className="text-red-500">*</span>
                                {selectedProduct?.unit && <span className="text-gray-500 ml-1">(in {selectedProduct.unit})</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg pr-20"
                                    placeholder="0.00"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-sm text-gray-500">
                                        {selectedProduct?.unit || 'Units'}
                                    </span>
                                </div>
                            </div>
                            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}

                            {/* Stock calculations */}
                            {data.type === 'out' && selectedProduct && data.quantity && (
                                <div className="mt-2">
                                    {Number(data.quantity) > selectedProduct.stock_qty ? (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                Insufficient stock! Available: {selectedProduct.stock_qty} {selectedProduct.unit || 'units'}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            Remaining: {selectedProduct.stock_qty - Number(data.quantity)} {selectedProduct.unit || 'units'}
                                        </p>
                                    )}
                                </div>
                            )}

                            {data.type === 'in' && selectedProduct && data.quantity && (
                                <p className="mt-2 text-sm text-green-600">
                                    New stock: {selectedProduct.stock_qty + Number(data.quantity)} {selectedProduct.unit || 'units'}
                                </p>
                            )}
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Reference / Invoice #
                            </label>
                            <input
                                type="text"
                                placeholder="PO-123, INV-456, etc."
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Note
                            </label>
                            <textarea
                                placeholder="Additional details..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <Link
                        href="/admin/inventory"
                        className="flex-1 text-center border py-2.5 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : (isEdit ? 'Update Stock' : 'Add Stock')}
                    </button>
                </div>
            </form>
        </div>
    );
}