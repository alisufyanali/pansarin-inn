import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Category = { id: number; name: string };
type Vendor = { id: number; shop_name: string };

export type ProductFormData = {
    name: string;
    category_id: string | number;
    vendor_id: string | number;
    short_description: string;
    long_description: string;
    price: string | number;
    sale_price: string | number;
    sku: string;
    thumbnail: string;
    status: boolean;
    featured: boolean;
};

interface ProductFormProps {
    product?: ProductFormData & { id?: number };
    categories: Category[];
    vendors: Vendor[];
    isEdit?: boolean;
}

export default function ProductForm({ product, categories, vendors, isEdit = false }: ProductFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<ProductFormData>({
        name: product?.name || '',
        category_id: product?.category_id || '',
        vendor_id: product?.vendor_id || '',
        short_description: product?.short_description || '',
        long_description: product?.long_description || '',
        price: product?.price || '',
        sale_price: product?.sale_price || '',
        sku: product?.sku || '',
        thumbnail: product?.thumbnail || '',
        status: product?.status ?? true,
        featured: product?.featured ?? false,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && product?.id) {
            put(`/admin/products/${product.id}`);
        } else {
            post('/admin/products');
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                    title="Back"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
                        {isEdit ? 'Update the product details below.' : 'Fill the form below to add a new product to the system.'}
                    </p>

                    <form onSubmit={submit} className="space-y-4 font-sans text-sm">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                            <input
                                type="text"
                                placeholder="Enter product name"
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                            <input
                                type="text"
                                placeholder="e.g., PROD-001"
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.sku}
                                onChange={e => setData('sku', e.target.value)}
                            />
                            {errors.sku && <div className="text-red-500 text-sm mt-1">{errors.sku}</div>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>}
                        </div>

                        {/* Vendor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
                            <select
                                value={data.vendor_id}
                                onChange={(e) => setData('vendor_id', e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a vendor (optional)</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>{vendor.shop_name}</option>
                                ))}
                            </select>
                            {errors.vendor_id && <div className="text-red-500 text-sm mt-1">{errors.vendor_id}</div>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                            <textarea
                                placeholder="Enter short product description"
                                rows={2}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.short_description}
                                onChange={e => setData('short_description', e.target.value)}
                            />
                            {errors.short_description && <div className="text-red-500 text-sm mt-1">{errors.short_description}</div>}
                        </div>

                        {/* Long Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Long Description</label>
                            <textarea
                                placeholder="Enter detailed product description"
                                rows={4}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.long_description}
                                onChange={e => setData('long_description', e.target.value)}
                            />
                            {errors.long_description && <div className="text-red-500 text-sm mt-1">{errors.long_description}</div>}
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Regular Price *</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.sale_price}
                                    onChange={e => setData('sale_price', e.target.value)}
                                />
                                {errors.sale_price && <div className="text-red-500 text-sm mt-1">{errors.sale_price}</div>}
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail Image URL</label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.thumbnail}
                                onChange={e => setData('thumbnail', e.target.value)}
                            />
                            {errors.thumbnail && <div className="text-red-500 text-sm mt-1">{errors.thumbnail}</div>}
                        </div>

                        {/* Status & Featured */}
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
                                    checked={data.featured}
                                    onChange={e => setData('featured', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-blue-600 focus:ring-2"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end items-center gap-2 pt-4">
                            <Link
                                href="/Products"
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
