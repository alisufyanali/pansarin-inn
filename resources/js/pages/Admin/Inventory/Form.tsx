import { Link, useForm } from '@inertiajs/react';
import { Package, TrendingDown, TrendingUp, Weight, AlertCircle, ArrowLeft, Search, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (data.product_id && products.length > 0) {
            const product = products.find((p) => p.id === Number(data.product_id));
            setSelectedProduct(product || null);
        } else {
            setSelectedProduct(null);
        }
    }, [data.product_id, products]);

    // Filter products based on search query
    const filteredProducts = products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            (p.unit && p.unit.toLowerCase().includes(query))
        );
    });

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
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEdit ? 'Edit Inventory Entry' : 'Add Stock Entry'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Product Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Product Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Select Product <span className="text-red-500 dark:text-red-400">*</span>
                            </label>
                            
                            {isEdit ? (
                                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : 'No product selected'}
                                </div>
                            ) : (
                                <div className="relative" ref={dropdownRef}>
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Search by name, SKU, or unit..."
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setIsDropdownOpen(true);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Selected Product Display */}
                                    {selectedProduct && !isDropdownOpen && (
                                        <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                {selectedProduct.name} ({selectedProduct.sku})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('product_id', '');
                                                    setSelectedProduct(null);
                                                    setSearchQuery('');
                                                }}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Dropdown List */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData('product_id', product.id);
                                                            setSelectedProduct(product);
                                                            setIsDropdownOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                                                            data.product_id === product.id
                                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    SKU: {product.sku}
                                                                    {product.unit && ` • ${product.unit}`}
                                                                </p>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <p className={`text-sm font-semibold ${
                                                                    product.stock_qty <= 0
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : product.stock_qty <= product.stock_alert
                                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                                        : 'text-green-600 dark:text-green-400'
                                                                }`}>
                                                                    Stock: {product.stock_qty}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No products found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {errors.product_id && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.product_id}</p>
                            )}
                        </div>

                        {selectedProduct && (
                            <div className={`rounded-lg border p-4 ${
                                isOutOfStock
                                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                    : isLowStock
                                    ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                                    : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <Package className={`mt-0.5 h-5 w-5 ${
                                        isOutOfStock
                                            ? 'text-red-600 dark:text-red-400'
                                            : isLowStock
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                    }`} />
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                                        {(isOutOfStock || isLowStock) && (
                                            <div className={`mt-2 flex items-center gap-2 ${
                                                isOutOfStock 
                                                    ? 'text-red-700 dark:text-red-400' 
                                                    : 'text-yellow-700 dark:text-yellow-400'
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
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Stock Entry Details</h3>

                    <div className="space-y-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Transaction Type <span className="text-red-500 dark:text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'in')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                        data.type === 'in'
                                            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-2 ring-green-200 dark:ring-green-800'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-semibold">Stock In</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Add inventory</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('type', 'out')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                        data.type === 'out'
                                            ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-200 dark:ring-red-800'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <TrendingDown className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-semibold">Stock Out</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Remove inventory</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Quantity <span className="text-red-500 dark:text-red-400">*</span>
                                {selectedProduct?.unit && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">(in {selectedProduct.unit})</span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                    placeholder="0.00"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedProduct?.unit || 'Units'}
                                    </span>
                                </div>
                            </div>
                            {errors.quantity && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.quantity}</p>
                            )}

                            {/* Stock calculations */}
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
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Reference / Invoice #
                            </label>
                            <input
                                type="text"
                                placeholder="PO-123, INV-456, etc."
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            />
                            {errors.reference && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.reference}</p>
                            )}
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Note
                            </label>
                            <textarea
                                placeholder="Additional details..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            />
                            {errors.note && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.note}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <Link
                        href="/admin/inventory"
                        className="flex-1 text-center border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        Cancel
                    </Link>
                    
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {processing ? 'Saving...' : (isEdit ? 'Update Stock' : 'Add Stock')}
                    </button>
                </div>
            </form>
        </div>
    );
}
