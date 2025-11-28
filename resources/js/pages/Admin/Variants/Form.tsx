import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Product = { id: number; name: string; price: number };
type AttributeValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; values: AttributeValue[] };

export type VariantFormData = {
    product_id: string | number;
    sku: string;
    price: string | number;
    stock: string | number;
    is_default: boolean;
    status: boolean;
    attributes: Record<string, string>;
};

interface VariantFormProps {
    variant?: VariantFormData & { id?: number };
    products: Product[];
    attributes?: Attribute[];
    isEdit?: boolean;
}

export default function VariantForm({ variant, products, attributes = [], isEdit = false }: VariantFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<VariantFormData>({
        product_id: variant?.product_id || '',
        sku: variant?.sku || '',
        price: variant?.price || '',
        stock: variant?.stock || '',
        is_default: variant?.is_default ?? false,
        status: variant?.status ?? true,
        attributes: variant?.attributes || {},
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && variant?.id) {
            put(`/product-variants/${variant.id}`);
        } else {
            post('/product-variants');
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/product-variants"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                    title="Back"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Variant' : 'Create New Variant'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
                        {isEdit ? 'Update the variant details below.' : 'Fill the form below to add a new product variant.'}
                    </p>

                    <form onSubmit={submit} className="space-y-4 font-sans text-sm">
                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product *</label>
                            <select
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a product</option>
                                {products.map((prod) => (
                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU (Stock Keeping Unit) *</label>
                            <input
                                type="text"
                                placeholder="e.g., VAR-001-S"
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.sku}
                                onChange={e => setData('sku', e.target.value)}
                            />
                            {errors.sku && <div className="text-red-500 text-sm mt-1">{errors.sku}</div>}
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                />
                                {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity *</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                />
                                {errors.stock && <div className="text-red-500 text-sm mt-1">{errors.stock}</div>}
                            </div>
                        </div>

                        {/* Status & Default */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={e => setData('status', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-blue-600 focus:ring-2"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status (Active)</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={e => setData('is_default', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-blue-600 focus:ring-2"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Variant</label>
                            </div>
                        </div>

                        {/* Attributes Section */}
                        {attributes.length > 0 && (
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Product Attributes</h3>
                                <div className="space-y-4">
                                    {attributes.map((attr) => (
                                        <div key={attr.id}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{attr.name}</label>
                                            <select
                                                value={data.attributes[attr.slug] || ''}
                                                onChange={(e) => setData('attributes', {
                                                    ...data.attributes,
                                                    [attr.slug]: e.target.value
                                                })}
                                                className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">Select {attr.name.toLowerCase()}</option>
                                                {attr.values.map((val) => (
                                                    <option key={val.id} value={val.value}>
                                                        {val.value}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end items-center gap-2 pt-4">
                            <Link
                                href="/product-variants"
                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                                title="Cancel"
                            >
                                <ArrowLeft />
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white w-10 h-10 shadow"
                                title={isEdit ? 'Update' : 'Create'}
                            >
                                <Check />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
