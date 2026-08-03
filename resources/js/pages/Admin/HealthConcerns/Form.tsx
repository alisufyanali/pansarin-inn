import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Save, Upload, X, Activity } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import {
    inputClass,
    cardClass,
    labelClass,
    buttonPrimaryClass,
    buttonSecondaryClass,
    subTextClass,
} from '@/utils/formStyles';
import { generateSlug } from '@/utils/formStyles';

export type HealthConcernFormData = {
    name: string;
    slug: string;
    icon: File | null;
    status: boolean;
    sort_order: number | string;
};

interface HealthConcernFormProps {
    concern?: HealthConcernFormData & { id?: number; icon?: string };
    isEdit?: boolean;
}

export default function Form({ concern, isEdit = false }: HealthConcernFormProps) {
    const [iconPreview, setIconPreview] = useState<string | null>(
        concern?.icon ? `/storage/${concern.icon}` : null
    );

    const { data, setData, errors, post, put, processing } = useForm<HealthConcernFormData>({
        name:       concern?.name       || '',
        slug:       concern?.slug       || '',
        icon:       null,
        status:     concern?.status     ?? true,
        sort_order: concern?.sort_order ?? 0,
    });

    // Auto-generate slug on create
    useEffect(() => {
        if (!isEdit && data.name) {
            setData('slug', generateSlug(data.name));
        }
    }, [data.name, isEdit]);

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('icon', file);
            const reader = new FileReader();
            reader.onloadend = () => setIconPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeIcon = () => {
        setData('icon', null);
        setIconPreview(null);
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && concern?.id) {
            put(`/admin/health-concerns/${concern.id}`, { forceFormData: true });
        } else {
            post('/admin/health-concerns', { forceFormData: true });
        }
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit Health Concern' : 'New Health Concern'}
                backUrl="/admin/health-concerns"
            />

            {(errors as any).error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {(errors as any).error}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Details ── */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    Health Concern Details
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Name + Slug */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={inputClass(errors.name)}
                                            placeholder="e.g. Digestive Health"
                                            required
                                        />
                                        <FieldError message={errors.name} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Slug <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={e => setData('slug', e.target.value)}
                                            className={inputClass(errors.slug)}
                                            placeholder="digestive-health"
                                        />
                                        <FieldError message={errors.slug} />
                                    </div>
                                </div>

                                {/* Sort Order + Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Sort Order</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={data.sort_order}
                                            onChange={e => setData('sort_order', e.target.value)}
                                            className={inputClass(errors.sort_order)}
                                            placeholder="0"
                                        />
                                        <FieldError message={errors.sort_order} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <label className={labelClass}>Active Status</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.status}
                                                    onChange={e => setData('status', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500" />
                                            </label>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {data.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Icon upload */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    Icon / Image
                                </h3>
                            </div>

                            {iconPreview ? (
                                <div className="relative">
                                    <img
                                        src={iconPreview}
                                        alt="Icon preview"
                                        className="w-full h-48 object-contain rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeIcon}
                                        className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                    ${errors.icon ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconChange}
                                        className="hidden"
                                        id="hc_icon"
                                    />
                                    <label htmlFor="hc_icon" className="cursor-pointer">
                                        <div className="py-6">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Click to upload icon
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, SVG, WebP (Max 2MB)</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                            <FieldError message={errors.icon} />
                        </div>
                    </div>

                    {/* ── Right: Actions ── */}
                    <div className="space-y-6">
                        <div className={cardClass}>
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={buttonPrimaryClass}
                                >
                                    <Save className="w-4 h-4" />
                                    {processing
                                        ? 'Saving...'
                                        : isEdit
                                            ? 'Update Health Concern'
                                            : 'Create Health Concern'}
                                </button>
                                <Link href="/admin/health-concerns" className={buttonSecondaryClass}>
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
