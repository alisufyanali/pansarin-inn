import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

type Product = { id: number; name: string; price: number };
type AttributeValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; values: AttributeValue[] };

interface VariantFormProps {
    variant?: any;
    products: Product[];
    attributes?: Attribute[];
    isEdit?: boolean;
}

export default function VariantForm({ variant, products, attributes = [], isEdit = false }: VariantFormProps) {
    interface FormData {
        product_id: string | number;
        sku: string;
        price: string | number;
        stock: string | number;
        is_default: boolean;
        status: boolean;
        size: string;
        type: string;
    }

    const { data, setData, errors, post, put, processing } = useForm<FormData>({
        product_id: variant?.product_id ?? '',
        sku: variant?.sku ?? '',
        price: variant?.price ?? '',
        stock: variant?.stock ?? '',
        is_default: variant?.is_default ?? false,
        status: variant?.status ?? true,
        size: variant?.attributes?.size ?? '',
        type: variant?.attributes?.type ?? '',
    });

    // SKU auto-generation: allow manual override
    const [skuManual, setSkuManual] = useState(false);

    useEffect(() => {
        if (variant?.sku) setSkuManual(true);
    }, []);

    useEffect(() => {
        if (skuManual) return;
        const prod = products.find(p => String(p.id) === String(data.product_id));
        if (!prod || !data.size || !data.type) return;
        const slugify = (s: any) => String(s || '')
            .replace(/\s+/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 6);
        const sku = `${prod.id}-${slugify(prod.name)}-${slugify(data.size)}-${slugify(data.type)}-${String(Date.now()).slice(-4)}`;
        if (!isEdit || !data.sku) {
            setData('sku', sku);
        }
    }, [data.product_id, data.size, data.type, skuManual]);

    // Auto-calculate price based on type (product price + 100 for Powder)
    useEffect(() => {
        const prod = products.find(p => String(p.id) === String(data.product_id));
        if (data.type === 'Powder' && prod) {
            const calculatedPrice = Number(prod.price) + 100;
            setData('price', String(calculatedPrice));
        } else if (data.type === 'Whole') {
            setData('price', '');
        }
    }, [data.type, data.product_id, products]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const submitData = {
        product_id: data.product_id,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        is_default: data.is_default,
        status: data.status,
        attributes: {
            size: data.size,
            type: data.type,
        }
    };


}

    const sizeAttribute = attributes.find(attr => attr.slug === 'size');
    const typeAttribute = attributes.find(attr => attr.slug === 'type');

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/product-variants"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        {isEdit ? 'Edit Variant' : 'Create Product Variant'}
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Product *
                            </label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a product</option>
                                {products.map((prod) => (
                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                        </div>

                        {/* 3 Column Section: Size | Type | Price */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Col 1: Size/Volume */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Size/Volume *
                                </label>
                                <select
                                    value={data.size}
                                    onChange={(e) => setData('size', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select size</option>
                                    {sizeAttribute?.values.map((val) => (
                                        <option key={val.id} value={val.value}>
                                            {val.value}
                                        </option>
                                    ))}
                                </select>
                                {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                            </div>

                            {/* Col 2: Type (Powder/Whole) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Type *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select type</option>
                                    {typeAttribute?.values.map((val) => (
                                        <option key={val.id} value={val.value}>
                                            {val.value}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>

                            {/* Col 3: Total Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Price (Rs) *
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {data.type === 'Powder' && (
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                            Auto: {data.price}
                                        </span>
                                    )}
                                </div>
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                            </div>
                        </div>

                        {/* SKU & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    SKU *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., VAR-001"
                                    value={data.sku}
                                    onChange={e => { setSkuManual(true); setData('sku', e.target.value); }}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                            </div>
                        </div>

                        {/* Status Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={e => setData('status', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active Status
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={e => setData('is_default', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Default Variant
                                </label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="/admin/product-variants"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                            >
                                <Check size={16} />
                                {isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
