import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
    const parseVariantAttributes = () => {
        if (!variant?.attributes) return {};

        if (typeof variant.attributes === 'string') {
            try {
                return JSON.parse(variant.attributes);
            } catch (e) {
                console.error('Failed to parse attributes:', e);
                return {};
            }
        }

        if (typeof variant.attributes === 'object') {
            return variant.attributes;
        }

        return {};
    };

    const variantAttrs = parseVariantAttributes();

    const createInitialFormData = () => {
        const formData: any = {
            product_id: variant?.product_id ?? '',
            sku: variant?.sku ?? '',
            price: variant?.price ?? '',
            stock: variant?.stock ?? '',
            is_default: variant?.is_default ?? false,
            status: variant?.status ?? true,
        };

        attributes.forEach(attr => {
            formData[attr.slug] = variantAttrs[attr.slug] || '';
        });

        return formData;
    };

    const { data, setData, errors, post, put, processing } = useForm(createInitialFormData());
    const [skuManual, setSkuManual] = useState(false);

    useEffect(() => {
        if (variant?.sku) setSkuManual(true);
    }, []);

    useEffect(() => {
        if (skuManual || !data.product_id) return;

        const prod = products.find(p => String(p.id) === String(data.product_id));
        if (!prod) return;

        const hasSelectedAttribute = attributes.some(attr => data[attr.slug]);
        if (!hasSelectedAttribute) return;

        const slugify = (s: any) => String(s || '')
            .replace(/\s+/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 6);

        const attrParts = attributes
            .filter(attr => data[attr.slug])
            .map(attr => slugify(data[attr.slug]))
            .join('-');

        const sku = `${prod.id}-${slugify(prod.name)}-${attrParts}-${String(Date.now()).slice(-4)}`;

        if (!isEdit || !data.sku) {
            setData('sku', sku);
        }
    }, [data.product_id, ...attributes.map(attr => data[attr.slug]), skuManual]);

    useEffect(() => {
        const typeAttr = attributes.find(attr => attr.slug === 'type');
        if (!typeAttr || !data.type) return;

        const prod = products.find(p => String(p.id) === String(data.product_id));
        if (!prod) return;

        if (data.type === 'Powder') {
            const calculatedPrice = Number(prod.price) + 100;
            setData('price', String(calculatedPrice));
        } else if (data.type === 'Whole' && !isEdit) {
            setData('price', String(prod.price));
        }
    }, [data.type, data.product_id, products]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const attributesData: any = {};
        attributes.forEach(attr => {
            if (data[attr.slug]) {
                attributesData[attr.slug] = data[attr.slug];
            }
        });

        const submitData = {
            product_id: data.product_id,
            sku: data.sku,
            price: data.price,
            stock: data.stock,
            is_default: data.is_default,
            status: data.status,
            attributes: JSON.stringify(attributesData)
        };

        if (isEdit && variant?.id) {
            put(`/admin/product-variants/${variant.id}`, submitData as any);
        } else {
            post('/admin/product-variants', submitData as any);
        }
    }

    const hasTypeAttribute = attributes.some(attr => attr.slug === 'type');

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <Link
                    href="/admin/product-variants"
                    className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 w-10 h-10 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Variant' : 'Create Variant'}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <form onSubmit={submit} className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Product *
                        </label>
                        <select
                            value={data.product_id}
                            onChange={(e) => setData('product_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="">Select product</option>
                            {products.map((prod) => (
                                <option key={prod.id} value={prod.id}>{prod.name}</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                    </div>

                    {attributes.length > 0 && (
                        <div className={`grid gap-4 ${attributes.length === 1 ? 'grid-cols-1' : attributes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {attributes.map((attr) => (
                                <div key={attr.id}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 capitalize">
                                        {attr.name} *
                                    </label>
                                    <select
                                        value={data[attr.slug] || ''}
                                        onChange={(e) => setData(attr.slug as any, e.target.value)}
                                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Select {attr.name.toLowerCase()}</option>
                                        {attr.values.map((val) => (
                                            <option key={val.id} value={val.value}>
                                                {val.value}
                                            </option>
                                        ))}
                                    </select>
                                    {errors[attr.slug] && <p className="text-red-500 text-xs mt-1">{errors[attr.slug]}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Price (Rs) *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                {hasTypeAttribute && data.type === 'Powder' && (
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                                        +100
                                    </span>
                                )}
                            </div>
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Stock *
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={data.stock}
                                onChange={e => setData('stock', e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            SKU *
                        </label>
                        <input
                            type="text"
                            placeholder="Auto-generated"
                            value={data.sku}
                            onChange={e => { setSkuManual(true); setData('sku', e.target.value); }}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={e => setData('status', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Status
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={e => setData('is_default', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Default Variant
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href="/admin/product-variants"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium"
                        >
                            <Check size={16} />
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}