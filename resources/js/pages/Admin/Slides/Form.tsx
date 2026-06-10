import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Monitor, Smartphone, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import FieldError from '@/components/FieldError';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

export type SlideFormData = {
    type:        'desktop' | 'mobile';
    title:       string;
    subtitle:    string;
    btn_text:    string;
    btn_url:     string;
    sort_order:  number;
    is_active:   boolean;
    image?:      File | null;
};

interface Props {
    slide?: SlideFormData & { id?: number; image?: string | null };
    isEdit?: boolean;
}

export default function Form({ slide, isEdit = false }: Props) {
    const [preview, setPreview] = useState<string | null>(
        slide?.image ? `/storage/${slide.image}` : null
    );

    const { data, setData, errors, post, put, processing } = useForm<SlideFormData>({
        type:       slide?.type       || 'desktop',
        title:      slide?.title      || '',
        subtitle:   slide?.subtitle   || '',
        btn_text:   slide?.btn_text   || '',
        btn_url:    slide?.btn_url    || '',
        sort_order: slide?.sort_order ?? 0,
        is_active:  slide?.is_active  ?? true,
        image:      null,
    });

    function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);
        if (file) setPreview(URL.createObjectURL(file));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const opts = { forceFormData: true };
        isEdit && slide?.id
            ? put(`/admin/slides/${slide.id}`, opts)
            : post('/admin/slides', opts);
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/slides" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Slide' : 'Add Slide'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className={cardClass}>
                    <div className="space-y-4">
                        {/* Type */}
                        <div>
                            <label className={labelClass}>Slide Type <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-3 mt-1">
                                {(['desktop', 'mobile'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setData('type', t)}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                                            data.type === t
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}>
                                        {t === 'desktop' ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <FieldError message={errors.type} />
                        </div>

                        {/* Image */}
                        <div>
                            <label className={labelClass}>Slide Image</label>
                            <div className="mt-1 space-y-2">
                                {preview && (
                                    <img src={preview} alt="preview" className="h-32 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                )}
                                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">{preview ? 'Change image' : 'Upload image'}</span>
                                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                                </label>
                            </div>
                            <FieldError message={errors.image} />
                        </div>

                        {/* Title */}
                        <div>
                            <label className={labelClass}>Title</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                placeholder="e.g. Pure Herbal Products" className={inputClass(errors.title)} />
                            <FieldError message={errors.title} />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className={labelClass}>Subtitle</label>
                            <textarea value={data.subtitle} onChange={e => setData('subtitle', e.target.value)}
                                rows={2} placeholder="Short description..." className={inputClass(errors.subtitle) + ' resize-none'} />
                            <FieldError message={errors.subtitle} />
                        </div>

                        {/* Button */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Button Text</label>
                                <input type="text" value={data.btn_text} onChange={e => setData('btn_text', e.target.value)}
                                    placeholder="e.g. Shop Now" className={inputClass(errors.btn_text)} />
                                <FieldError message={errors.btn_text} />
                            </div>
                            <div>
                                <label className={labelClass}>Button URL</label>
                                <input type="text" value={data.btn_url} onChange={e => setData('btn_url', e.target.value)}
                                    placeholder="/shop" className={inputClass(errors.btn_url)} />
                                <FieldError message={errors.btn_url} />
                            </div>
                        </div>

                        {/* Sort Order + Active */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Sort Order</label>
                                <input type="number" min="0" value={data.sort_order}
                                    onChange={e => setData('sort_order', Number(e.target.value))}
                                    className={inputClass(errors.sort_order)} />
                                <FieldError message={errors.sort_order} />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <div className="space-y-3">
                        <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : isEdit ? 'Update Slide' : 'Create Slide'}
                        </button>
                        <Link href="/admin/slides" className={buttonSecondaryClass}>Cancel</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
