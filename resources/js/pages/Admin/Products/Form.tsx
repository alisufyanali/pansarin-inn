import { Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Upload, X, Info, Search, Loader2, Zap, Trash2, AlertCircle } from 'lucide-react';

type Category  = { id: number; name: string };
type AttrValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; category_id: number; values: AttrValue[] };

type Variation = {
    combination: string;
    attributes: Record<string, string>;
    qty: string;
    purchase_price: string;
    sale_price: string;
};

export type ProductFormData = {
    name: string;
    category_id: string | number;
    sub_category_id: string | number;
    short_description: string;
    long_description: string;
    urdu_name: string;
    scientific_name: string;
    slug: string;
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
    selected_attributes: Record<number, number[]>;
    variations: Variation[];
};

interface ProductFormProps {
    product?: any;
    categories: Category[];
    attributes?: Attribute[];
    isEdit?: boolean;
}

function cartesian(arrays: AttrValue[][]): AttrValue[][] {
    return arrays.reduce<AttrValue[][]>(
        (acc, curr) => acc.flatMap((combo) => curr.map((val) => [...combo, val])),
        [[]]
    );
}

const inputCls = "w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm";

export default function ProductForm({ product, categories, attributes = [], isEdit = false }: ProductFormProps) {
    const [thumbnailPreview,   setThumbnailPreview]   = useState<string | null>(product?.thumbnail    || null);
    const [socialImagePreview, setSocialImagePreview] = useState<string | null>(product?.social_image || null);
    const [galleryPreviews,    setGalleryPreviews]    = useState<string[]>(Array.isArray(product?.gallery) ? product.gallery : []);
    const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
    const [loadingAttrs,       setLoadingAttrs]       = useState(false);

    const { data, setData, errors, post, processing } = useForm<ProductFormData>({
        name:                product?.name             || '',
        category_id:         product?.category_id      || '',
        sub_category_id:     product?.sub_category_id  || '',
        short_description:   product?.short_description || '',
        long_description:    product?.long_description  || '',
        urdu_name:           product?.urdu_name         || '',
        scientific_name:     product?.scientific_name   || '',
        slug:                product?.slug              || '',
        sku:                 product?.sku               || '',
        barcode:             product?.barcode           || '',
        stock_qty:           product?.stock_qty         || '',
        stock_alert:         product?.stock_alert       || '',
        status:              product?.status  ?? true,
        featured:            product?.featured ?? false,
        meta_title:          product?.meta_title        || '',
        meta_description:    product?.meta_description  || '',
        meta_keywords:       product?.meta_keywords     || '',
        tags:                product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '',
        schema_markup:       product?.schema_markup     || '',
        social_description:  product?.social_description || '',
        thumbnail:           product?.thumbnail         || null,
        social_image:        product?.social_image      || null,
        gallery:             product?.gallery           || [],
        selected_attributes: product?.selected_attributes || {},
        variations:          product?.variations        || [],
    });

    useEffect(() => {
        if (!data.category_id) {
            setCategoryAttributes([]);
            setData('selected_attributes', {});
            setData('variations', []);
            return;
        }
        const filtered = attributes.filter((a) => a.category_id === Number(data.category_id));
        if (filtered.length > 0) {
            setCategoryAttributes(filtered);
        } else {
            setLoadingAttrs(true);
            fetch(`/admin/products/attributes-by-category?category_id=${data.category_id}`)
                .then((r) => r.json())
                .then((d: Attribute[]) => { setCategoryAttributes(d); setLoadingAttrs(false); })
                .catch(() => setLoadingAttrs(false));
        }
        setData('selected_attributes', {});
        setData('variations', []);
    }, [data.category_id]);

    const toggleValue = (attrId: number, valId: number) => {
        const curr = data.selected_attributes[attrId] || [];
        setData('selected_attributes', {
            ...data.selected_attributes,
            [attrId]: curr.includes(valId) ? curr.filter((i) => i !== valId) : [...curr, valId],
        });
        setData('variations', []);
    };

    const isChecked = (attrId: number, valId: number) =>
        (data.selected_attributes[attrId] || []).includes(valId);

    const generateVariations = () => {
        const selectedGroups: { attrName: string; values: AttrValue[] }[] = [];
        categoryAttributes.forEach((attr) => {
            const selectedIds = data.selected_attributes[attr.id] || [];
            if (selectedIds.length === 0) return;
            const selectedVals = attr.values.filter((v) => selectedIds.includes(v.id));
            if (selectedVals.length > 0) {
                selectedGroups.push({ attrName: attr.name, values: selectedVals });
            }
        });
        if (selectedGroups.length === 0) return;
        const combos = cartesian(selectedGroups.map((g) => g.values));
        const newVariations: Variation[] = combos.map((combo) => {
            const attrs: Record<string, string> = {};
            combo.forEach((val, idx) => { attrs[selectedGroups[idx].attrName] = val.value; });
            return {
                combination: combo.map((v) => v.value).join(' / '),
                attributes:  attrs,
                qty:          '',
                purchase_price: '',
                sale_price:     '',
            };
        });
        setData('variations', newVariations);
    };

    const updateVariation = (index: number, field: keyof Variation, value: string) => {
        const updated = [...data.variations];
        (updated[index] as any)[field] = value;
        setData('variations', updated);
    };

    const removeVariation = (index: number) => {
        const updated = [...data.variations];
        updated.splice(index, 1);
        setData('variations', updated);
    };

    const hasSelectedAttributes = Object.values(data.selected_attributes).some((v) => v.length > 0);

    const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) { setData('thumbnail', f); const r = new FileReader(); r.onloadend = () => setThumbnailPreview(r.result as string); r.readAsDataURL(f); }
    };
    const handleSocialImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) { setData('social_image', f); const r = new FileReader(); r.onloadend = () => setSocialImagePreview(r.result as string); r.readAsDataURL(f); }
    };
    const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const prev: string[] = [];
        setData('gallery', files);
        files.forEach((f) => { const r = new FileReader(); r.onloadend = () => { prev.push(r.result as string); if (prev.length === files.length) setGalleryPreviews(prev); }; r.readAsDataURL(f); });
    };
    const removeGallery = (i: number) => {
        const p = [...galleryPreviews]; p.splice(i, 1); setGalleryPreviews(p);
        const g = [...(data.gallery as File[])]; g.splice(i, 1); setData('gallery', g);
    };

    const generateSlug = (n: string) => n.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.name)        { alert('Product Name is required!'); return; }
        if (!data.category_id) { alert('Category is required!');     return; }
        const submitData = {
            ...data,
            tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        };
        if (isEdit && product?.id) {
            router.post(`/admin/products/${product.id}`, { ...submitData, _method: 'PUT' }, { forceFormData: true });
        } else {
            post('/admin/products', { forceFormData: true });
        }
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
            </div>

            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                                Please fix the following errors:
                            </h3>
                            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-5"><div className="w-2 h-6 bg-blue-600 rounded-full"></div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3></div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Enter product name" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputCls} />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category <span className="text-red-500">*</span></label>
                                        <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={inputCls + " appearance-none"}>
                                            <option value="">Select category</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urdu Name</label><input type="text" placeholder="اردو نام" value={data.urdu_name} onChange={(e) => setData('urdu_name', e.target.value)} className={inputCls} /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scientific Name</label><input type="text" placeholder="Curcuma longa" value={data.scientific_name} onChange={(e) => setData('scientific_name', e.target.value)} className={inputCls} /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label><textarea value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} rows={2} placeholder="Brief product description" className={inputCls + " resize-none"} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Long Description</label><textarea value={data.long_description} onChange={(e) => setData('long_description', e.target.value)} rows={4} placeholder="Detailed product description" className={inputCls + " resize-none"} /></div>
                            </div>
                        </div>

                        {/* STEP 1: Select Attributes */}
                        {data.category_id && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1 — Select Variations</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Use Multiple select </span>
                                </div>
                                {loadingAttrs ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                                        <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
                                    </div>
                                ) : categoryAttributes.length === 0 ? (
                                    <p className="text-center py-8 text-sm text-gray-400">Is category mein koi attribute nahi hai</p>
                                ) : (
                                    <div className="space-y-5">
                                        {categoryAttributes.map((attr, idx) => (
                                            <div key={attr.id}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{attr.name}</span>
                                                    {(data.selected_attributes[attr.id] || []).length > 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                                                            {(data.selected_attributes[attr.id] || []).length} selected
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map((val) => {
                                                        const checked = isChecked(attr.id, val.id);
                                                        return (
                                                            <button key={val.id} type="button" onClick={() => toggleValue(attr.id, val.id)}
                                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ${
                                                                    checked
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                                                }`}
                                                            >
                                                                {checked && <Check className="w-3.5 h-3.5" />}
                                                                {val.value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {idx < categoryAttributes.length - 1 && <div className="mt-5 border-t border-gray-100 dark:border-gray-700" />}
                                            </div>
                                        ))}
                                        {hasSelectedAttributes && (
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <button type="button" onClick={generateVariations}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md">
                                                    <Zap className="w-4 h-4" />Generate Variations
                                                </button>
                                                <p className="text-xs text-gray-400 mt-2">Sab selected values ka Cartesian combination banega</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Variations Table */}
                        {data.variations.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2 — Variations Pricing</h3>
                                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                                            {data.variations.length} combinations
                                        </span>
                                    </div>
                                </div>

                                {/* ── Proper HTML Table ── */}
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Combination</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                                                    Qty <span className="text-red-400">*</span>
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                                                    Purchase Price <span className="text-red-400">*</span>
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                                                    Sale Price <span className="text-red-400">*</span>
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">P&L</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Additional</th>
                                                <th className="px-4 py-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                            {data.variations.map((variation, index) => {
                                                const pp = parseFloat(variation.purchase_price) || 0;
                                                const sp = parseFloat(variation.sale_price) || 0;
                                                const profit = pp > 0 && sp > 0 ? sp - pp : null;
                                                const isLoss = profit !== null && profit <= 0;

                                                return (
                                                    <tr key={index} className={`transition-colors ${
                                                        isLoss
                                                            ? 'bg-red-50/60 dark:bg-red-900/10'
                                                            : profit && profit > 0
                                                                ? 'bg-green-50/40 dark:bg-green-900/5'
                                                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-900/30'
                                                    }`}>
                                                        {/* Row number */}
                                                        <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-mono align-middle">
                                                            {index + 1}
                                                        </td>

                                                        {/* Combination Badges */}
                                                        <td className="px-4 py-3 align-middle">
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(variation.attributes).map(([attrName, val]) => (
                                                                    <span key={attrName} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                                                                        <span className="text-indigo-400 mr-1">{attrName}:</span>{val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>

                                                        {/* Qty */}
                                                        <td className="px-4 py-3 align-middle">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder="0"
                                                                value={variation.qty}
                                                                onChange={(e) => updateVariation(index, 'qty', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                            />
                                                        </td>

                                                        {/* Purchase Price */}
                                                        <td className="px-4 py-3 align-middle">
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    value={variation.purchase_price}
                                                                    onChange={(e) => updateVariation(index, 'purchase_price', e.target.value)}
                                                                    className="w-full pl-1 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                                />
                                                        </td>

                                                        {/* Sale Price */}
                                                        <td className="px-4 py-3 align-middle">
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    value={variation.sale_price}
                                                                    onChange={(e) => updateVariation(index, 'sale_price', e.target.value)}
                                                                    className={`w-full pl-1 pr-3 py-2 rounded-lg border text-sm focus:ring-2 outline-none transition bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
                                                                        isLoss
                                                                            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                                                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                                                    }`}
                                                                />
                                                        </td>

                                                        {/* Profit / Loss badge */}
                                                        <td className="px-4 py-3 align-middle">
                                                            {profit !== null ? (
                                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                                                    isLoss
                                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                }`}>
                                                                    {isLoss ? '▼' : '▲'} Rs {Math.abs(profit).toFixed(2)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                            )}
                                                        </td>

                                                         {/* Additional */}
                                                        <td className="px-4 py-3 align-middle">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                min="0"
                                                                placeholder="0" 
                                                                className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                                                bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2
                                                                 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                            />
                                                        </td>

                                                        {/* Delete */}
                                                        <td className="px-4 py-3 align-middle text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVariation(index)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary footer */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>{data.variations.filter(v => v.qty && v.purchase_price && v.sale_price).length} of {data.variations.length} variations filled</span>
                                    <button type="button" onClick={generateVariations} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Regenerate
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Images */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-5"><div className="w-2 h-6 bg-purple-600 rounded-full"></div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Images</h3></div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition">
                                        <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" id="thumbnail" />
                                        <label htmlFor="thumbnail" className="cursor-pointer block">
                                            {thumbnailPreview ? (
                                                <div className="relative"><img src={thumbnailPreview} alt="" className="h-40 w-full object-cover rounded-lg" /><button type="button" onClick={() => { setThumbnailPreview(null); setData('thumbnail', null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button></div>
                                            ) : (
                                                <div className="py-8"><Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" /><p className="text-sm text-gray-500">Click to upload thumbnail</p><p className="text-xs text-gray-400 mt-1">800x800px recommended</p></div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gallery Images</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition">
                                        <input type="file" multiple accept="image/*" onChange={handleGallery} className="hidden" id="gallery" />
                                        <label htmlFor="gallery" className="cursor-pointer block"><div className="py-6"><Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Click to upload multiple images</p></div></label>
                                    </div>
                                    {galleryPreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {galleryPreviews.map((p, i) => (
                                                <div key={i} className="relative"><img src={p} alt="" className="h-20 w-full object-cover rounded-lg" /><button type="button" onClick={() => removeGallery(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* SEO */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-5"><div className="w-2 h-6 bg-yellow-500 rounded-full"></div><Search className="w-4 h-4 text-yellow-500" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title <span className="text-xs text-gray-400">(max 60)</span></label>
                                    <input type="text" placeholder="SEO title" value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} className={inputCls} maxLength={60} />
                                    <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">{data.meta_title.length}/60</span>{data.meta_title.length >= 55 && <span className="text-xs text-amber-500">Getting long</span>}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description <span className="text-xs text-gray-400">(max 160)</span></label>
                                    <textarea value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} rows={3} placeholder="Search description" className={inputCls + " resize-none"} maxLength={160} />
                                    <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">{data.meta_description.length}/160</span>{data.meta_description.length >= 150 && <span className="text-xs text-amber-500">Near limit</span>}</div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Keywords</label><input type="text" placeholder="keyword1, keyword2" value={data.meta_keywords} onChange={(e) => setData('meta_keywords', e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label><input type="text" placeholder="tag1, tag2" value={data.tags} onChange={(e) => setData('tags', e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema Markup</label><textarea value={data.schema_markup} onChange={(e) => setData('schema_markup', e.target.value)} rows={3} placeholder='{"@context":"https://schema.org"}' className={inputCls + " resize-none font-mono text-xs"} /></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Image</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 text-center hover:border-blue-500 transition">
                                        <input type="file" accept="image/*" onChange={handleSocialImg} className="hidden" id="social_image" />
                                        <label htmlFor="social_image" className="cursor-pointer block">
                                            {socialImagePreview ? (
                                                <div className="relative"><img src={socialImagePreview} alt="" className="h-28 w-full object-cover rounded-lg" /><button type="button" onClick={() => { setSocialImagePreview(null); setData('social_image', null); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button></div>
                                            ) : (
                                                <div className="py-5"><Upload className="w-7 h-7 mx-auto text-gray-400 mb-1" /><p className="text-xs text-gray-400">1200x630px recommended</p></div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Description</label>
                                    <textarea value={data.social_description} onChange={(e) => setData('social_description', e.target.value)} rows={2} placeholder="Social media description" className={inputCls + " resize-none"} maxLength={300} />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-5"><div className="w-2 h-6 bg-orange-500 rounded-full"></div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3></div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div><div className="text-sm font-medium text-gray-900 dark:text-white">Active Status</div><div className="text-xs text-gray-400">Show product publicly</div></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={data.status} onChange={(e) => setData('status', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div><div className="text-sm font-medium text-gray-900 dark:text-white">Featured</div><div className="text-xs text-gray-400">Show on homepage</div></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={data.featured} onChange={(e) => setData('featured', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                                    <input type="text" placeholder="Auto-generated" value={data.sku} onChange={(e) => setData('sku', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="product-slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className={inputCls} />
                                        <button type="button" onClick={() => setData('slug', generateSlug(data.name))} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition whitespace-nowrap">Generate</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="space-y-3">
                                <button type="submit" disabled={processing} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {processing
                                        ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</>
                                        : <><Check className="w-5 h-5" />{isEdit ? 'Update Product' : 'Create Product'}</>
                                    }
                                </button>
                                <Link href="/admin/products" className="block w-full py-3 text-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm">Cancel</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}