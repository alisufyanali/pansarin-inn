import { Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Upload, X, Info, Search, Globe } from 'lucide-react';

type Category = { id: number; name: string };
type Attribute = { id: number; name: string; slug: string; values: any[] };

export type ProductFormData = {
    name: string;
    category_id: string | number;
    sub_category_id: string | number;
    short_description: string;
    long_description: string;
    urdu_name: string;
    scientific_name: string;
    alternative_name: string;
    other_name: string;
    slug: string;
    unit: string;
    quantity: string | number;
    purchase_price_per_unit: string | number;
    sale_price_per_unit: string | number;
    price: string | number;
    sale_price: string | number;
    sku: string;
    barcode: string;
    stock_qty: string | number;
    stock_alert: string | number;
    status: boolean;
    featured: boolean;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    tags: string;
    schema_markup: string;
    social_description: string;
    thumbnail: File | string | null;
    social_image: File | string | null;
    gallery: File[] | string[];
};

interface ProductFormProps {
    product?: Omit<ProductFormData, 'gallery' | 'social_image'> & {
        id?: number;
        gallery?: string[];
        social_image?: string;
        thumbnail?: string;
    };
    categories: Category[];
    attributes?: Attribute[];
    isEdit?: boolean;
}

export default function ProductForm({
    product,
    categories,
    attributes = [],
    isEdit = false,
}: ProductFormProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(product?.thumbnail || null);
    const [socialImagePreview, setSocialImagePreview] = useState<string | null>(product?.social_image || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
        Array.isArray(product?.gallery) ? product.gallery : []
    );

    const { data, setData, errors, post, processing } = useForm<ProductFormData>({
        name: product?.name || '',
        category_id: product?.category_id || '',
        sub_category_id: product?.sub_category_id || '',
        short_description: product?.short_description || '',
        long_description: product?.long_description || '',
        urdu_name: product?.urdu_name || '',
        scientific_name: product?.scientific_name || '',
        alternative_name: product?.alternative_name || '',
        other_name: product?.other_name || '',
        slug: product?.slug || '',
        unit: product?.unit || '',
        quantity: product?.quantity || '',
        purchase_price_per_unit: product?.purchase_price_per_unit || '',
        sale_price_per_unit: product?.sale_price_per_unit || '',
        price: product?.price || '',
        sale_price: product?.sale_price || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        stock_qty: product?.stock_qty || '',
        stock_alert: product?.stock_alert || '',
        status: product?.status ?? true,
        featured: product?.featured ?? false,
        meta_title: product?.meta_title || '',
        meta_description: product?.meta_description || '',
        meta_keywords: product?.meta_keywords || '',
        tags: product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '',
        schema_markup: product?.schema_markup || '',
        social_description: product?.social_description || '',
        thumbnail: product?.thumbnail || null,
        social_image: product?.social_image || null,
        gallery: product?.gallery || [],
    });

    useEffect(() => {
        const qty = parseFloat(data.quantity as string) || 0;
        const purchasePricePerUnit = parseFloat(data.purchase_price_per_unit as string) || 0;
        const salePricePerUnit = parseFloat(data.sale_price_per_unit as string) || 0;

        if (qty > 0 && purchasePricePerUnit > 0) {
            setData('price', (qty * purchasePricePerUnit).toFixed(2));
        }

        if (qty > 0 && salePricePerUnit > 0) {
            setData('sale_price', (qty * salePricePerUnit).toFixed(2));
        }
    }, [data.quantity, data.purchase_price_per_unit, data.sale_price_per_unit]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSocialImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('social_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSocialImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('gallery', files);

        const previews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === files.length) {
                    setGalleryPreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryImage = (index: number) => {
        const newPreviews = [...galleryPreviews];
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);

        const newGallery = [...(data.gallery as File[])];
        newGallery.splice(index, 1);
        setData('gallery', newGallery);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!data.name) {
            alert('Product Name is required!');
            return;
        }
        if (!data.category_id) {
            alert('Category is required!');
            return;
        }
        if (!data.unit) {
            alert('Unit is required!');
            return;
        }
        if (!data.quantity || parseFloat(data.quantity as string) <= 0) {
            alert('Quantity must be greater than 0!');
            return;
        }
        if (!data.purchase_price_per_unit || parseFloat(data.purchase_price_per_unit as string) <= 0) {
            alert('Purchase Price Per Unit is required!');
            return;
        }
        if (!data.sale_price_per_unit || parseFloat(data.sale_price_per_unit as string) <= 0) {
            alert('Sale Price Per Unit is required!');
            return;
        }

        const purchasePricePerUnit = parseFloat(data.purchase_price_per_unit as string);
        const salePricePerUnit = parseFloat(data.sale_price_per_unit as string);

        if (salePricePerUnit <= purchasePricePerUnit) {
            alert('Sale price per unit must be greater than purchase price per unit!');
            return;
        }

        const submitData = {
            ...data,
            tags: data.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
        };

        if (isEdit && product?.id) {
            router.post(`/admin/products/${product.id}`, { ...submitData, _method: 'PUT' }, { forceFormData: true });
        } else {
            post('/admin/products', { forceFormData: true });
        }
    }

    const calculateProfit = () => {
        const purchasePrice = parseFloat(data.purchase_price_per_unit as string) || 0;
        const salePrice = parseFloat(data.sale_price_per_unit as string) || 0;
        const qty = parseFloat(data.quantity as string) || 0;

        if (purchasePrice > 0 && salePrice > 0 && qty > 0) {
            const profitPerUnit = salePrice - purchasePrice;
            const totalProfit = profitPerUnit * qty;
            const profitMargin = ((profitPerUnit / purchasePrice) * 100).toFixed(2);
            return { profitPerUnit, totalProfit, profitMargin };
        }
        return null;
    };

    const profitData = calculateProfit();

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Product' : 'Create New Product'}
                </h1>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Important: Fill all required fields marked with *</p>
                        <p>Sale price must be higher than purchase price for profitability.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><Info className="w-4 h-4" /> {errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urdu Name</label>
                                        <input
                                            type="text"
                                            placeholder="اردو نام"
                                            value={data.urdu_name}
                                            onChange={(e) => setData('urdu_name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scientific Name</label>
                                        <input
                                            type="text"
                                            placeholder="Curcuma longa"
                                            value={data.scientific_name}
                                            onChange={(e) => setData('scientific_name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                                    <textarea
                                        placeholder="Brief product description"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Long Description</label>
                                    <textarea
                                        placeholder="Detailed product description"
                                        value={data.long_description}
                                        onChange={(e) => setData('long_description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Inventory</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Unit <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                                        >
                                            <option value="">Select unit</option>
                                            {attributes.find((attr) => attr.slug === 'unit')?.values.map((val) => (
                                                <option key={val.id} value={val.value}>{val.value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="100"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="md:col-span-3 grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Purchase Price/Unit <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={data.purchase_price_per_unit}
                                                onChange={(e) => setData('purchase_price_per_unit', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Sale Price/Unit <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={data.sale_price_per_unit}
                                                onChange={(e) => setData('sale_price_per_unit', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Profit Summary */}
                                {profitData && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Profit Summary</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Profit/Unit</div>
                                                <div className="text-xl font-bold text-green-600 dark:text-green-400">Rs {profitData.profitPerUnit.toFixed(2)}</div>
                                            </div>
                                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
                                                <div className="text-xl font-bold text-green-600 dark:text-green-400">Rs {profitData.totalProfit.toFixed(2)}</div>
                                            </div>
                                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Margin</div>
                                                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{profitData.profitMargin}%</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                                        <input
                                            type="text"
                                            placeholder="Auto-generated"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Barcode</label>
                                        <input
                                            type="text"
                                            placeholder="Barcode"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Quantity</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={data.stock_qty}
                                            onChange={(e) => setData('stock_qty', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Low Stock Alert</label>
                                        <input
                                            type="number"
                                            placeholder="5"
                                            value={data.stock_alert}
                                            onChange={(e) => setData('stock_alert', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Images */}

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Images</h3>
                            </div>
                            <div className="space-y-6">

                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thumbnail Image</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            id="thumbnail"
                                        />
                                        <label htmlFor="thumbnail" className="cursor-pointer block">
                                            {thumbnailPreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={thumbnailPreview}
                                                        alt="Thumbnail"
                                                        className="h-40 w-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setThumbnailPreview(null);
                                                            setData('thumbnail', null);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-8">
                                                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload thumbnail</p>
                                                    <p className="text-xs text-gray-500 mt-1">Recommended: 800x800px</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>



                                {/* Gallery */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Gallery Images</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleGalleryChange}
                                            className="hidden"
                                            id="gallery"
                                        />
                                        <label htmlFor="gallery" className="cursor-pointer block">
                                            <div className="py-6">
                                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload multiple images</p>
                                                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, GIF</p>
                                            </div>
                                        </label>
                                    </div>

                                    {galleryPreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {galleryPreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="h-20 w-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Sidebar (1/3) */}
                    <div className="space-y-6">

                        {/* SEO Section - ADDED BACK */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-6 bg-yellow-600 rounded-full"></div>
                                <Search className="w-5 h-5 text-yellow-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Title <span className="text-xs text-gray-500">(max 60)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="SEO optimized title"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        maxLength={60}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.meta_title.length}/60 characters
                                        </div>
                                        {data.meta_title.length >= 55 && (
                                            <div className="text-xs text-amber-600">Getting long</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Description <span className="text-xs text-gray-500">(max 160)</span>
                                    </label>
                                    <textarea
                                        placeholder="Search result description"
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                        maxLength={160}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.meta_description.length}/160 characters
                                        </div>
                                        {data.meta_description.length >= 150 && (
                                            <div className="text-xs text-amber-600">Near limit</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="keyword1, keyword2, keyword3"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Separate with commas
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="tag1, tag2, tag3"
                                        value={data.tags}
                                        onChange={(e) => setData('tags', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Product tags for filtering
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Schema Markup (JSON-LD)
                                    </label>
                                    <textarea
                                        placeholder='{"@context":"https://schema.org"}'
                                        value={data.schema_markup}
                                        onChange={(e) => setData('schema_markup', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none font-mono text-sm"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        For rich search results
                                    </div>
                                </div>
                                {/* Social Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Media Image</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSocialImageChange}
                                            className="hidden"
                                            id="social_image"
                                        />
                                        <label htmlFor="social_image" className="cursor-pointer block">
                                            {socialImagePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={socialImagePreview}
                                                        alt="Social Media"
                                                        className="h-32 w-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSocialImagePreview(null);
                                                            setData('social_image', null);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-6">
                                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Upload for social sharing</div>
                                                    <p className="text-xs text-gray-500 mt-1">1200x630px recommended</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Social Description <span className="text-xs text-gray-500">(max 300)</span>
                                    </label>
                                    <textarea
                                        placeholder="Description for social media shares"
                                        value={data.social_description}
                                        onChange={(e) => setData('social_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                        maxLength={300}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.social_description.length}/300 characters
                                        </div>
                                        {data.social_description.length >= 280 && (
                                            <div className="text-xs text-amber-600">Long description</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-6 bg-orange-600 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Active Status</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Show product publicly</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Featured Product</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Highlight on homepage</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.featured}
                                            onChange={(e) => setData('featured', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="product-name-slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setData('slug', generateSlug(data.name))}
                                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            {isEdit ? 'Update Product' : 'Create Product'}
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/admin/products"
                                    className="block w-full py-3 text-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}