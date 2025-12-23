import { Link, router, useForm } from '@inertiajs/react';
import React from 'react';

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
    const { data, setData, errors, post, processing } =
        useForm<ProductFormData>({
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
            tags: product?.tags
                ? Array.isArray(product.tags)
                    ? product.tags.join(', ')
                    : product.tags
                : '',
            schema_markup: product?.schema_markup || '',
            social_description: product?.social_description || '',
            thumbnail: product?.thumbnail || null,
            social_image: product?.social_image || null,
            gallery: product?.gallery || [],
        });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
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
        if (!data.price) {
            alert('Price is required!');
            return;
        }

        // Convert tags string to JSON array for backend
        const submitData = {
            ...data,
            tags: data.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag),
        };

        if (isEdit && product?.id) {
            router.post(
                `/admin/products/${product.id}`,
                {
                    ...submitData,
                    _method: 'PUT',
                },
                {
                    forceFormData: true,
                },
            );
        } else {
            post('/admin/products', {
                forceFormData: true,
            });
        }
    }

    return (
        <div className="p-3">
            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/admin/products"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    title="Back"
                >
                    ←
                </Link>
            </div>

            <div className="mx-auto max-w-6xl py-6">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Product' : 'Create New Product'}
                </h2>

                <form onSubmit={submit} className="space-y-6">
                    {/* CARD 1: Basic Details */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                            Basic Details
                        </h3>
                        <div className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter product name"
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <div className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category *
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData('category_id', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <div className="mt-1 text-sm text-red-500">
                                        {errors.category_id}
                                    </div>
                                )}
                            </div>

                            {/* Sub Category */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sub Category
                                </label>
                                <select
                                    value={data.sub_category_id}
                                    onChange={(e) =>
                                        setData(
                                            'sub_category_id',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="">
                                        Select sub category
                                    </option>
                                </select>
                            </div> */}

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Short Description
                                </label>
                                <textarea
                                    placeholder="Brief description"
                                    value={data.short_description}
                                    onChange={(e) =>
                                        setData(
                                            'short_description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Long Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Long Description
                                </label>
                                <textarea
                                    placeholder="Detailed description"
                                    value={data.long_description}
                                    onChange={(e) =>
                                        setData(
                                            'long_description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Urdu Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Urdu Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="اردو نام"
                                    value={data.urdu_name}
                                    onChange={(e) =>
                                        setData('urdu_name', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Scientific Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Scientific Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Curcuma longa"
                                    value={data.scientific_name}
                                    onChange={(e) =>
                                        setData(
                                            'scientific_name',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Alternative Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Alternative Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Other name"
                                    value={data.alternative_name}
                                    onChange={(e) =>
                                        setData(
                                            'alternative_name',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Other Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Other Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Additional name"
                                    value={data.other_name}
                                    onChange={(e) =>
                                        setData('other_name', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Slug
                                </label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="auto-generated-slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData('slug', e.target.value)
                                        }
                                        className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'slug',
                                                generateSlug(data.name),
                                            )
                                        }
                                        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Unit
                                </label>
                                <select
                                    value={data.unit}
                                    onChange={(e) =>
                                        setData('unit', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="">Select unit</option>
                                    {attributes
                                        .find((attr) => attr.slug === 'unit')
                                        ?.values.map((val) => (
                                            <option
                                                key={val.id}
                                                value={val.value}
                                            >
                                                {val.value}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Pricing & Status */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                            Pricing & Status
                        </h3>
                        <div className="space-y-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Price (Rs) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                {errors.price && (
                                    <div className="mt-1 text-sm text-red-500">
                                        {errors.price}
                                    </div>
                                )}
                            </div>

                            {/* Sale Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sale Price (Rs)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.sale_price}
                                    onChange={(e) =>
                                        setData('sale_price', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* SKU & Barcode */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        value={data.sku}
                                        onChange={(e) =>
                                            setData('sku', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Barcode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Product barcode"
                                        value={data.barcode}
                                        onChange={(e) =>
                                            setData('barcode', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Stock Quantity & Alert */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={data.stock_qty}
                                        onChange={(e) =>
                                            setData('stock_qty', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock Alert
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="5"
                                        value={data.stock_alert}
                                        onChange={(e) =>
                                            setData(
                                                'stock_alert',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-2 dark:border-gray-700"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status (Active)
                                </label>
                            </div>

                            {/* Featured */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.featured}
                                    onChange={(e) =>
                                        setData('featured', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-2 dark:border-gray-700"
                                />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Featured Product
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: SEO & Meta */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                            SEO & Meta Information
                        </h3>
                        <div className="space-y-4">
                            {/* Meta Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    maxLength={60}
                                    placeholder="SEO title"
                                    value={data.meta_title}
                                    onChange={(e) =>
                                        setData('meta_title', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                                    {data.meta_title.length}/60
                                </div>
                            </div>

                            {/* Meta Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Meta Description
                                </label>
                                <textarea
                                    maxLength={160}
                                    placeholder="Search result description"
                                    value={data.meta_description}
                                    onChange={(e) =>
                                        setData(
                                            'meta_description',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                                    {data.meta_description.length}/160
                                </div>
                            </div>

                            {/* Meta Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    placeholder="keyword1, keyword2, keyword3"
                                    value={data.meta_keywords}
                                    onChange={(e) =>
                                        setData('meta_keywords', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    placeholder="tag1, tag2, tag3"
                                    value={data.tags}
                                    onChange={(e) =>
                                        setData('tags', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Schema Markup */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Schema Markup (JSON-LD)
                                </label>
                                <textarea
                                    placeholder='{"@context":"https://schema.org",...}'
                                    value={data.schema_markup}
                                    onChange={(e) =>
                                        setData('schema_markup', e.target.value)
                                    }
                                    rows={3}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            {/* Social Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Social Description
                                </label>
                                <textarea
                                    maxLength={300}
                                    placeholder="For social sharing"
                                    value={data.social_description}
                                    onChange={(e) =>
                                        setData(
                                            'social_description',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="mt-1 w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                                    {data.social_description.length}/300
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Images */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Images
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Thumbnail Image */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Thumbnail Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'thumbnail',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                                {product?.thumbnail &&
                                    typeof product.thumbnail === 'string' && (
                                        <div className="mt-2">
                                            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                Current:
                                            </p>
                                            <img
                                                src={product.thumbnail}
                                                alt="Thumbnail"
                                                className="h-24 w-24 rounded object-cover"
                                            />
                                        </div>
                                    )}
                            </div>

                            {/* Social Media Image */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Social Media Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'social_image',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                                {product?.social_image &&
                                    typeof product.social_image ===
                                        'string' && (
                                        <div className="mt-2">
                                            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                Current:
                                            </p>
                                            <img
                                                src={product.social_image}
                                                alt="Social Image"
                                                className="h-24 w-24 rounded object-cover"
                                            />
                                        </div>
                                    )}
                            </div>

                            {/* Gallery Images */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Gallery Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'gallery',
                                            Array.from(e.target.files || []),
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                                {Array.isArray(product?.gallery) &&
                                    product.gallery.length > 0 && (
                                        <div className="mt-3">
                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                                Current Gallery:
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                {product.gallery.map(
                                                    (img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative"
                                                        >
                                                            <img
                                                                src={
                                                                    typeof img ===
                                                                    'string'
                                                                        ? img
                                                                        : URL.createObjectURL(
                                                                              img,
                                                                          )
                                                                }
                                                                alt={`Gallery ${idx}`}
                                                                className="h-24 w-full rounded object-cover"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="mt-8 flex items-center justify-end gap-2">
                        <Link
                            href="/admin/products"
                            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {processing
                                ? 'Processing...'
                                : isEdit
                                  ? 'Update Product'
                                  : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
