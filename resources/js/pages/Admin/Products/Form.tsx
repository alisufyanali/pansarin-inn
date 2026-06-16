import { Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Upload, X, Search, Loader2, Zap, Trash2, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Category  = { id: number; name: string };
type AttrValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; category_id: number; values: AttrValue[] };
type Variation = {
    combination: string; attributes: Record<string, string>;
    purchase_price: string; sale_price: string;
    stock_alert: string; additional: string; current_stock: string;
};

export type ProductFormData = {
    // Basic
    name: string; category_id: string | number; sub_category_id: string | number;
    urdu_name: string; scientific_name: string; alternative_name: string; other_name: string;
    unit: string; slug: string; sku: string; barcode: string;
    short_description: string; long_description: string;
    // Pricing/Stock (product level)
    stock_qty: string | number; stock_alert: string | number;
    affiliate_commission: string | number;            // ← NEW
    sort_order: string | number;                      // ← NEW
    // Media
    video: string;                                    // ← NEW
    thumbnail: File | string | null; social_image: File | string | null; gallery: File[] | string[];
    // Flags
    status: boolean; featured: boolean;
    // SEO
    meta_title: string; meta_description: string; meta_keywords: string;
    schema_markup: string; social_description: string; tags: string;
    // Variants
    selected_attributes: Record<number, number[]>; variations: Variation[];
};

interface ProductFormProps {
    product?: any; categories: Category[]; attributes?: Attribute[]; isEdit?: boolean;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const cx = {
    input:    "w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm",
    inputErr: "w-full px-4 py-2 rounded-lg border text-sm focus:ring-2 outline-none transition bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-red-400 focus:ring-red-400",
    inputSm:  "w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm",
    card:     "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6",
    label:    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    thCell:   "text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
    tdCell:   "px-3 py-2 align-middle",
    dash:     "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 transition",
    toggle:   "w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
};

// ─── Reusable ─────────────────────────────────────────────────────────────────
const Card = ({ color, title, icon, children }: { color: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <div className={cx.card}>
        <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-6 ${color} rounded-full`} />{icon}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {children}
    </div>
);

const Field = ({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) => (
    <div>
        <label className={cx.label}>{label}{required && <span className="text-red-500 ml-1">*</span>}{hint && <span className="text-xs text-gray-400 ml-1">{hint}</span>}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const Toggle = ({ checked, onChange, color = 'peer-checked:bg-blue-600' }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className={`${cx.toggle} ${color}`} />
    </label>
);

const ImageUpload = ({ id, preview, onFile, onClear, height = 'h-40', hint }: {
    id: string; preview: string | null; onFile: (f: File) => void; onClear: () => void; height?: string; hint?: string;
}) => (
    <div className={cx.dash}>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} className="hidden" id={id} />
        <label htmlFor={id} className="cursor-pointer block">
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="" className={`${height} w-full object-cover rounded-lg`} />
                    <button type="button" onClick={(e) => { e.preventDefault(); onClear(); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                </div>
            ) : (
                <div className="py-8"><Upload className="w-9 h-9 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Click to upload</p>{hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}</div>
            )}
        </label>
    </div>
);

const CharCount = ({ val, max, warn }: { val: string; max: number; warn?: number }) => (
    <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{val.length}/{max}</span>
        {warn && val.length >= warn && <span className="text-xs text-amber-500">Getting long</span>}
    </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cartesian(arrays: AttrValue[][]): AttrValue[][] {
    return arrays.reduce<AttrValue[][]>((acc, curr) => acc.flatMap((c) => curr.map((v) => [...c, v])), [[]]);
}
const toSlug  = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
const readFile = (f: File, cb: (r: string) => void) => { const r = new FileReader(); r.onloadend = () => cb(r.result as string); r.readAsDataURL(f); };

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProductForm({ product, categories, attributes = [], isEdit = false }: ProductFormProps) {
    // ── Normalize storage path to URL ──
    const toUrl = (path: any): string | null => {
        if (!path || path instanceof File) return null;
        if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('/storage') || path.startsWith('blob'))) return path;
        return `/storage/${path}`;
    };

    const [thumbPrev,    setThumbPrev]    = useState<string | null>(toUrl(product?.thumbnail));
    const [socialPrev,   setSocialPrev]   = useState<string | null>(toUrl(product?.social_image));
    const [galleryPrev,  setGalleryPrev]  = useState<string[]>(
        Array.isArray(product?.gallery)
            ? product.gallery.map((g: any) => toUrl(g)).filter(Boolean) as string[]
            : []
    );
    const [catAttrs,     setCatAttrs]     = useState<Attribute[]>([]);
    const [loadingAttrs, setLoadingAttrs] = useState(false);

    const { data, setData, errors, post, processing } = useForm<ProductFormData>({
        name:                 product?.name                 || '',
        category_id:          product?.category_id          || '',
        sub_category_id:      product?.sub_category_id      || '',
        urdu_name:            product?.urdu_name            || '',
        scientific_name:      product?.scientific_name      || '',
        alternative_name:     product?.alternative_name     || '',
        other_name:           product?.other_name           || '',
        unit:                 product?.unit                 || '',
        slug:                 product?.slug                 || '',
        sku:                  product?.sku                  || '',
        barcode:              product?.barcode              || '',
        short_description:    product?.short_description    || '',
        long_description:     product?.long_description     || '',
        stock_qty:            product?.stock_qty            || '',
        stock_alert:          product?.stock_alert          || '',
        affiliate_commission: product?.affiliate_commission ?? 5,
        sort_order:           product?.sort_order           ?? 0,
        video:                product?.video                || '',
        thumbnail:            product?.thumbnail            || null,
        social_image:         product?.social_image         || null,
        gallery:              product?.gallery              || [],
        status:               product?.status  ?? true,
        featured:             product?.featured ?? false,
        meta_title:           product?.meta_title           || '',
        meta_description:     product?.meta_description     || '',
        meta_keywords:        product?.meta_keywords        || '',
        schema_markup:        product?.schema_markup        || '',
        social_description:   product?.social_description   || '',
        tags:                 product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '',
        selected_attributes:  product?.selected_attributes  || {},
        variations:           product?.variations           || [],
    });

    // Track initial mount to avoid clearing variations on edit load
    const isInitialMount = React.useRef(true);
    const hasLoadedInitialVariations = React.useRef(false);

    // Load attributes on category change
    useEffect(() => {
        if (!data.category_id) { setCatAttrs([]); setData('selected_attributes', {}); setData('variations', []); return; }
        const filtered = attributes.filter((a) => a.category_id === Number(data.category_id));
        if (filtered.length > 0) { setCatAttrs(filtered); }
        else {
            setLoadingAttrs(true);
            fetch(`/admin/products/attributes-by-category?category_id=${data.category_id}`)
                .then((r) => r.json()).then((d) => { setCatAttrs(d); setLoadingAttrs(false); })
                .catch(() => setLoadingAttrs(false));
        }
        
        // Only clear variations on user-driven category change, NOT on initial edit load
        if (isInitialMount.current) {
            isInitialMount.current = false;
            // In edit mode, mark that we've loaded initial variations
            if (isEdit && product?.variations && product.variations.length > 0) {
                hasLoadedInitialVariations.current = true;
            }
        } else {
            // Only clear if we're not in edit mode with loaded variations
            if (!hasLoadedInitialVariations.current) {
                setData('selected_attributes', {}); 
                setData('variations', []);
            }
        }
    }, [data.category_id]);

    // Reconstruct selected_attributes from existing variations in edit mode
    useEffect(() => {
        if (isEdit && product?.variations && product.variations.length > 0 && catAttrs.length > 0) {
            const reconstructed: Record<number, number[]> = {};
            
            // Extract all unique attribute values from variations
            product.variations.forEach((variation: any) => {
                if (variation.attributes) {
                    Object.entries(variation.attributes).forEach(([attrName, attrValue]) => {
                        // Find the attribute by name
                        const attr = catAttrs.find(a => a.name === attrName);
                        if (attr) {
                            // Find the value ID
                            const val = attr.values.find(v => v.value === attrValue);
                            if (val) {
                                if (!reconstructed[attr.id]) {
                                    reconstructed[attr.id] = [];
                                }
                                if (!reconstructed[attr.id].includes(val.id)) {
                                    reconstructed[attr.id].push(val.id);
                                }
                            }
                        }
                    });
                }
            });

            if (Object.keys(reconstructed).length > 0) {
                setData('selected_attributes', reconstructed);
            }
        }
    }, [catAttrs, isEdit]);

    // Debug: Check variations after everything is initialized
    useEffect(() => {
        console.log('🔍 Checking variations render:', {
            variationsLength: data.variations.length,
            hasVariations: data.variations.length > 0,
            variations: data.variations
        });
    }, [data.variations]);

    const toggleVal  = (attrId: number, valId: number) => {
        const curr = data.selected_attributes[attrId] || [];
        setData('selected_attributes', { ...data.selected_attributes, [attrId]: curr.includes(valId) ? curr.filter((i) => i !== valId) : [...curr, valId] });
        setData('variations', []);
    };
    const isChecked  = (attrId: number, valId: number) => (data.selected_attributes[attrId] || []).includes(valId);

    const generateVariations = () => {
        const groups = catAttrs.flatMap((attr) => {
            const vals = attr.values.filter((v) => (data.selected_attributes[attr.id] || []).includes(v.id));
            return vals.length ? [{ attrName: attr.name, values: vals }] : [];
        });
        if (!groups.length) return;
        
        const newVariations = cartesian(groups.map((g) => g.values)).map((combo) => ({
            combination:    combo.map((v) => v.value).join(' / '),
            attributes:     Object.fromEntries(combo.map((v, i) => [groups[i].attrName, v.value])),
            purchase_price: '',
            sale_price:     '',
            stock_alert:    '5',   // default
            additional:     '0',   // default
            current_stock:  '0',   // default opening stock
        }));
        
        console.log('Generated variations:', newVariations);
        setData('variations', newVariations);
    };

    const updateVar = (i: number, field: keyof Variation, val: string) => {
        const updated = [...data.variations]; (updated[i] as any)[field] = val; setData('variations', updated);
    };
    const removeVar = (i: number) => { const v = [...data.variations]; v.splice(i, 1); setData('variations', v); };
    const hasSelected = Object.values(data.selected_attributes).some((v) => v.length > 0);

    const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const prev: string[] = [];
        setData('gallery', files);
        files.forEach((f) => readFile(f, (r) => { prev.push(r); if (prev.length === files.length) setGalleryPrev([...prev]); }));
    };
    const removeGalleryItem = (i: number) => {
        const p = [...galleryPrev]; p.splice(i, 1); setGalleryPrev(p);
        const g = [...(data.gallery as File[])]; g.splice(i, 1); setData('gallery', g);
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.name)        { alert('Product Name is required!'); return; }
        if (!data.category_id) { alert('Category is required!');     return; }

        const tags         = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
        const thumbnail    = data.thumbnail    instanceof File ? data.thumbnail    : null;
        const social_image = data.social_image instanceof File ? data.social_image : null;
        const gallery      = (data.gallery as any[]).filter((f) => f instanceof File);

        // Ensure variations are included in submit data
        const submitData = { 
            ...data, 
            tags, 
            thumbnail, 
            social_image, 
            gallery,
            variations: data.variations  // Explicitly include variations
        };

        if (isEdit && product?.id) {
            router.post(`/admin/products/${product.id}`, { ...submitData, _method: 'PUT' }, { forceFormData: true });
        } else {
            post('/admin/products', { forceFormData: true });
        }
    }

    // Variation table headers
    const varHeaders = ['#', 'Combination', 'Purchase Rs *', 'Sale Rs *', 'P&L', 'Stock Alert', 'Current Stock', '+ Price', ''];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Product' : 'Create Product'}</h1>
            </div>

            {/* Errors */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                        {Object.entries(errors).map(([k, m]) => <li key={k}>{m}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── Basic Info ── */}
                        <Card color="bg-blue-600" title="Basic Information">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Product Name" required error={errors.name}>
                                        <input type="text" placeholder="Enter product name" value={data.name} onChange={(e) => setData('name', e.target.value)} className={cx.input} />
                                    </Field>
                                    <Field label="Category" required>
                                        <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={cx.input + " appearance-none"}>
                                            <option value="">Select category</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* 4-col name grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Urdu Name"><input type="text" placeholder="اردو نام" value={data.urdu_name} onChange={(e) => setData('urdu_name', e.target.value)} className={cx.input} /></Field>
                                    <Field label="Scientific Name"><input type="text" placeholder="Curcuma longa" value={data.scientific_name} onChange={(e) => setData('scientific_name', e.target.value)} className={cx.input} /></Field>
                                    <Field label="Alternative Name"><input type="text" placeholder="Alternative name" value={data.alternative_name} onChange={(e) => setData('alternative_name', e.target.value)} className={cx.input} /></Field>
                                    <Field label="Other Name"><input type="text" placeholder="Other / local name" value={data.other_name} onChange={(e) => setData('other_name', e.target.value)} className={cx.input} /></Field>
                                </div>

                                <Field label="Short Description"><textarea value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} rows={2} className={cx.input + " resize-none"} /></Field>
                                <Field label="Long Description"><textarea value={data.long_description} onChange={(e) => setData('long_description', e.target.value)} rows={4} className={cx.input + " resize-none"} /></Field>

                                {/* Video URL */}
                                <Field label="Video URL" hint="(YouTube / Vimeo)">
                                    <input type="url" placeholder="https://youtube.com/watch?v=..." value={data.video} onChange={(e) => setData('video', e.target.value)} className={cx.input} />
                                </Field>
                            </div>
                        </Card>

                        {/* ── Step 1: Attributes ── */}
                        {data.category_id && (
                            <Card color="bg-indigo-600" title="Step 1 — Select Variations">
                                {loadingAttrs ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /><span>Loading...</span></div>
                                ) : catAttrs.length === 0 ? (
                                    <p className="text-center py-8 text-sm text-gray-400">No attributes for this category</p>
                                ) : (
                                    <div className="space-y-5">
                                        {catAttrs.map((attr, idx) => (
                                            <div key={attr.id}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{attr.name}</span>
                                                    {(data.selected_attributes[attr.id] || []).length > 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                                                            {(data.selected_attributes[attr.id] || []).length} selected
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map((val) => {
                                                        const checked = isChecked(attr.id, val.id);
                                                        return (
                                                            <button key={val.id} type="button" onClick={() => toggleVal(attr.id, val.id)}
                                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 hover:border-indigo-400'}`}>
                                                                {checked && <Check className="w-3.5 h-3.5" />}{val.value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {idx < catAttrs.length - 1 && <div className="mt-5 border-t border-gray-100 dark:border-gray-700" />}
                                            </div>
                                        ))}
                                        {hasSelected && (
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <button type="button" onClick={generateVariations}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm">
                                                    <Zap className="w-4 h-4" /> Generate Variations
                                                </button>
                                                <p className="text-xs text-gray-400 mt-2">Cartesian combination of all selected values</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* ── Step 2: Variations Table ── */}
                        {data.variations.length > 0 && (
                            <Card color="bg-green-600" title="Step 2 — Variations Pricing">
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
                                                {varHeaders.map((h, i) => <th key={i} className={cx.thCell}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                            {data.variations.map((v, i) => {
                                                const pp     = parseFloat(v.purchase_price) || 0;
                                                const sp     = parseFloat(v.sale_price)     || 0;
                                                const profit = pp > 0 && sp > 0 ? sp - pp : null;
                                                const isLoss = profit !== null && profit <= 0;
                                                const rowCls = isLoss
                                                    ? 'bg-red-50/60 dark:bg-red-900/10'
                                                    : profit && profit > 0
                                                        ? 'bg-green-50/40 dark:bg-green-900/5'
                                                        : 'bg-white dark:bg-gray-800';
                                                return (
                                                    <tr key={i} className={`transition-colors ${rowCls}`}>
                                                        {/* # */}
                                                        <td className={`${cx.tdCell} text-xs text-gray-400 font-mono w-8`}>{i + 1}</td>

                                                        {/* Combination badges */}
                                                        <td className={cx.tdCell}>
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(v.attributes).map(([k, val]) => (
                                                                    <span key={k} className="px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                                                                        <span className="text-indigo-400 mr-1">{k}:</span>{val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>

                                                        {/* Purchase Price */}
                                                        <td className={`${cx.tdCell} w-28`}>
                                                            <input type="number" step="0.1" min="0" placeholder="0.00" value={v.purchase_price} onChange={(e) => updateVar(i, 'purchase_price', e.target.value)} className={cx.inputSm} />
                                                        </td>

                                                        {/* Sale Price */}
                                                        <td className={`${cx.tdCell} w-28`}>
                                                            <input type="number" step="0.1" min="0" placeholder="0.00" value={v.sale_price} onChange={(e) => updateVar(i, 'sale_price', e.target.value)}
                                                                className={`${cx.inputSm} ${isLoss ? 'border-red-400 focus:ring-red-400' : ''}`} />
                                                        </td>

                                                        {/* P&L */}
                                                        <td className={`${cx.tdCell} w-24`}>
                                                            {profit !== null ? (
                                                                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${isLoss ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                    {isLoss ? '▼' : '▲'} {Math.abs(profit).toFixed(0)}
                                                                </span>
                                                            ) : <span className="text-xs text-gray-300">—</span>}
                                                        </td>

                                                        {/* Stock Alert */}
                                                        <td className={`${cx.tdCell} w-24`}>
                                                            <input type="number" step="1" min="0" placeholder="5" value={v.stock_alert} onChange={(e) => updateVar(i, 'stock_alert', e.target.value)} className={cx.inputSm} />
                                                        </td>

                                                        {/* Current Stock */}
                                                        <td className={`${cx.tdCell} w-24`}>
                                                            <input type="number" step="1" min="0" placeholder="0" value={v.current_stock ?? '0'} onChange={(e) => updateVar(i, 'current_stock', e.target.value)} className={cx.inputSm} />
                                                        </td>

                                                        {/* Additional Price ← NEW */}
                                                        <td className={`${cx.tdCell} w-24`}>
                                                            <input type="number" step="0.1" min="0" placeholder="0" value={v.additional} onChange={(e) => updateVar(i, 'additional', e.target.value)} className={cx.inputSm} />
                                                        </td>

                                                        {/* Delete */}
                                                        <td className={`${cx.tdCell} text-center w-10`}>
                                                            <button type="button" onClick={() => removeVar(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
                                    <span>{data.variations.filter(v => v.purchase_price && v.sale_price).length} of {data.variations.length} filled</span>
                                    <button type="button" onClick={generateVariations} className="text-xs text-indigo-600 flex items-center gap-1"><Zap className="w-3 h-3" /> Regenerate</button>
                                </div>

                                {/* Column legend */}
                                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                                    <span>🔔 <strong>Stock Alert</strong> — low stock threshold</span>
                                    <span>📦 <strong>Current Stock</strong> — opening stock (auto-synced to Inventory)</span>
                                    <span>➕ <strong>+ Price</strong> — extra charge for this variant</span>
                                </div>
                            </Card>
                        )}

                        {/* ── Images ── */}
                        <Card color="bg-purple-600" title="Images">
                            <div className="space-y-5">
                                <Field label="Thumbnail Image">
                                    <ImageUpload id="thumbnail" preview={thumbPrev} hint="800x800px recommended"
                                        onFile={(f) => { setData('thumbnail', f); readFile(f, setThumbPrev); }}
                                        onClear={() => { setThumbPrev(null); setData('thumbnail', null); }} />
                                </Field>
                                <Field label="Gallery Images">
                                    <div className={cx.dash}>
                                        <input type="file" multiple accept="image/*" onChange={handleGallery} className="hidden" id="gallery" />
                                        <label htmlFor="gallery" className="cursor-pointer block py-6 text-center">
                                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Upload multiple images</p>
                                        </label>
                                    </div>
                                    {galleryPrev.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {galleryPrev.map((p, i) => (
                                                <div key={i} className="relative">
                                                    <img src={p} alt="" className="h-20 w-full object-cover rounded-lg" />
                                                    <button type="button" onClick={() => removeGalleryItem(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                            </div>
                        </Card>
                    </div>

                    {/* ══ Sidebar ══════════════════════════════════════════════ */}
                    <div className="space-y-6">

                        {/* SEO */}
                        <Card color="bg-yellow-500" title="SEO Settings" icon={<Search className="w-4 h-4 text-yellow-500" />}>
                            <div className="space-y-4">
                                <Field label="Meta Title" hint="(max 60)">
                                    <input type="text" placeholder="SEO title" value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} className={cx.input} maxLength={60} />
                                    <CharCount val={data.meta_title} max={60} warn={55} />
                                </Field>
                                <Field label="Meta Description" hint="(max 160)">
                                    <textarea value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} rows={3} className={cx.input + " resize-none"} maxLength={160} />
                                    <CharCount val={data.meta_description} max={160} warn={150} />
                                </Field>
                                <Field label="Meta Keywords"><input type="text" placeholder="keyword1, keyword2" value={data.meta_keywords} onChange={(e) => setData('meta_keywords', e.target.value)} className={cx.input} /></Field>
                                <Field label="Tags"><input type="text" placeholder="tag1, tag2" value={data.tags} onChange={(e) => setData('tags', e.target.value)} className={cx.input} /></Field>
                                <Field label="Schema Markup"><textarea value={data.schema_markup} onChange={(e) => setData('schema_markup', e.target.value)} rows={3} className={cx.input + " resize-none font-mono text-xs"} /></Field>
                                <Field label="Social Image">
                                    <ImageUpload id="social_image" preview={socialPrev} height="h-28" hint="1200x630px recommended"
                                        onFile={(f) => { setData('social_image', f); readFile(f, setSocialPrev); }}
                                        onClear={() => { setSocialPrev(null); setData('social_image', null); }} />
                                </Field>
                                <Field label="Social Description">
                                    <textarea value={data.social_description} onChange={(e) => setData('social_description', e.target.value)} rows={2} className={cx.input + " resize-none"} maxLength={300} />
                                </Field>
                            </div>
                        </Card>

                        {/* Settings */}
                        <Card color="bg-orange-500" title="Settings">
                            <div className="space-y-4">
                                {/* Toggles */}
                                {[
                                    { label: 'Active Status', sub: 'Show product publicly', key: 'status'   as const, color: 'peer-checked:bg-blue-600'  },
                                    { label: 'Featured',      sub: 'Show on homepage',      key: 'featured' as const, color: 'peer-checked:bg-green-600' },
                                ].map(({ label, sub, key, color }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div><div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div><div className="text-xs text-gray-400">{sub}</div></div>
                                        <Toggle checked={data[key] as boolean} onChange={(v) => setData(key, v)} color={color} />
                                    </div>
                                ))}

                                {/* Unit */}
                                <Field label="Unit" hint="(gm, ml, piece...)">
                                    <input type="text" placeholder="e.g. gm" value={data.unit} onChange={(e) => setData('unit', e.target.value)} className={cx.input} />
                                </Field>

                                {/* SKU + Barcode */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="SKU"><input type="text" placeholder="Auto-generated" value={data.sku} onChange={(e) => setData('sku', e.target.value)} className={cx.input} /></Field>
                                    <Field label="Barcode"><input type="text" placeholder="Barcode" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} className={cx.input} /></Field>
                                </div>

                                {/* Affiliate + Sort Order */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Affiliate %" hint="(commission)">
                                        <input type="number" step="0.01" min="0" max="100" placeholder="5.00" value={data.affiliate_commission} onChange={(e) => setData('affiliate_commission', e.target.value)} className={cx.input} />
                                    </Field>
                                    <Field label="Sort Order">
                                        <input type="number" step="1" min="0" placeholder="0" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} className={cx.input} />
                                    </Field>
                                </div>

                                {/* Slug */}
                                <Field label="Slug">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="product-slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className={cx.input} />
                                        <button type="button" onClick={() => setData('slug', toSlug(data.name))} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition whitespace-nowrap">Gen</button>
                                    </div>
                                </Field>
                            </div>
                        </Card>

                        {/* Submit */}
                        <div className={cx.card}>
                            <div className="space-y-3">
                                <button type="submit" disabled={processing} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {processing
                                        ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                                        : <><Check className="w-5 h-5" />{isEdit ? 'Update Product' : 'Create Product'}</>}
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