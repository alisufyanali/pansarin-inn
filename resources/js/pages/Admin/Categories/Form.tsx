import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Save, Upload, X, Folder, Search, Globe, Code } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass, subTextClass } from '@/utils/formStyles';
import { generateSlug } from '@/utils/formStyles';

type Category = { id: number; name: string };

export type CategoryFormData = {
    name: string;
    slug: string;
    parent_id: string | number;
    image: File | null;
    status: boolean;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    schema_markup?: string;
    social_image?: File | null;
    social_description?: string;
};

interface CategoryFormProps {
    category?: CategoryFormData & { id?: number; image?: string; social_image?: string };
    categories: Category[];
    isEdit?: boolean;
}

export default function Form({ category, categories, isEdit = false }: CategoryFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        category?.image ? `/storage/${category.image}` : null
    );
    const [socialImagePreview, setSocialImagePreview] = useState<string | null>(
        category?.social_image ? `/storage/${category.social_image}` : null
    );

    const { data, setData, errors, post, put, processing } = useForm<CategoryFormData>({
        name: category?.name || '',
        slug: category?.slug || '',
        parent_id: category?.parent_id || '',
        image: null,
        status: category?.status ?? true,
        meta_title: category?.meta_title || '',
        meta_description: category?.meta_description || '',
        meta_keywords: category?.meta_keywords || '',
        schema_markup: category?.schema_markup || '',
        social_image: null,
        social_description: category?.social_description || '',
    });

    // Auto-generate slug from name (only on create)
    useEffect(() => {
        if (!isEdit && data.name) {
            setData('slug', generateSlug(data.name));
        }
    }, [data.name, isEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSocialImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('social_image', file);
            const reader = new FileReader();
            reader.onloadend = () => setSocialImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeSocialImage = () => {
        setData('social_image', null);
        setSocialImagePreview(null);
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && category?.id) {
            put(`/admin/categories/${category.id}`, {
                forceFormData: true,
            });
        } else {
            post('/admin/categories', { forceFormData: true });
        }
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit Category' : 'New Category'}
                backUrl="/admin/categories"
            />

            {/* Global error banner */}
            {(errors as any).error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {(errors as any).error}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== LEFT COLUMN ===== */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Category Details */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Folder className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Category Details</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Name + Slug - ek row mein */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>
                                            Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={inputClass(errors.name)}
                                            placeholder="Enter category name"
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
                                            placeholder="category-slug"
                                            required
                                        />
                                        <FieldError message={errors.slug} />
                                    </div>
                                </div>

                                {/* Parent Category + Status - ek row mein */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Parent Category</label>
                                        <select
                                            value={data.parent_id}
                                            onChange={e => setData('parent_id', e.target.value)}
                                            className={inputClass(errors.parent_id)}
                                        >
                                            <option value="">None (Main Category)</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <FieldError message={errors.parent_id} />
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
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                                            </label>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {data.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Main Image */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Category Image</h3>
                            </div>

                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg border dark:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                    ${errors.image ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="category_image"
                                    />
                                    <label htmlFor="category_image" className="cursor-pointer">
                                        <div className="py-6">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Click to upload image
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                PNG, JPG, GIF (Max 2MB)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}
                            <FieldError message={errors.image} />
                        </div>

                        {/* Social Media */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Social Media</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Social Image */}
                                <div>
                                    <label className={labelClass}>Social Image</label>
                                    {socialImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={socialImagePreview}
                                                alt="Social Preview"
                                                className="w-full h-40 object-cover rounded-lg border dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeSocialImage}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`border-2 border-dashed rounded-lg p-3 transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                            ${errors.social_image ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSocialImageChange}
                                                className="hidden"
                                                id="social_image"
                                            />
                                            <label htmlFor="social_image" className="cursor-pointer block text-center">
                                                <div className="py-2">
                                                    <div className="w-8 h-8 mx-auto bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mb-1">
                                                        <Globe className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Upload social image</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1200x630px recommended</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                    <FieldError message={errors.social_image} />
                                </div>

                                {/* Social Description */}
                                <div>
                                    <label className={labelClass}>
                                        Social Description{' '}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">(max 300)</span>
                                    </label>
                                    <textarea
                                        value={data.social_description}
                                        onChange={e => setData('social_description', e.target.value)}
                                        maxLength={300}
                                        rows={2}
                                        className={inputClass(errors.social_description) + ' text-sm'}
                                        placeholder="Social media description"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError message={errors.social_description} />
                                        <span className={subTextClass + ' ml-auto'}>
                                            {data.social_description?.length || 0}/300
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN ===== */}
                    <div className="space-y-6">

                        {/* SEO Settings */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">SEO Settings</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Meta Title */}
                                <div>
                                    <label className={labelClass}>
                                        Meta Title{' '}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">(max 60)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={e => setData('meta_title', e.target.value)}
                                        maxLength={60}
                                        className={inputClass(errors.meta_title) + ' text-sm'}
                                        placeholder="SEO optimized title"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError message={errors.meta_title} />
                                        <span className={subTextClass + ' ml-auto'}>
                                            {data.meta_title?.length || 0}/60
                                        </span>
                                    </div>
                                </div>

                                {/* Meta Description */}
                                <div>
                                    <label className={labelClass}>
                                        Meta Description{' '}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">(max 160)</span>
                                    </label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        maxLength={160}
                                        rows={2}
                                        className={inputClass(errors.meta_description) + ' text-sm'}
                                        placeholder="Brief description for search engines"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError message={errors.meta_description} />
                                        <span className={subTextClass + ' ml-auto'}>
                                            {data.meta_description?.length || 0}/160
                                        </span>
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div>
                                    <label className={labelClass}>Keywords</label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={e => setData('meta_keywords', e.target.value)}
                                        className={inputClass(errors.meta_keywords) + ' text-sm'}
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                    <FieldError message={errors.meta_keywords} />
                                </div>

                                {/* Schema Markup */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Schema Markup
                                        </label>
                                    </div>
                                    <textarea
                                        value={data.schema_markup}
                                        onChange={e => setData('schema_markup', e.target.value)}
                                        rows={4}
                                        className={inputClass(errors.schema_markup) + ' text-sm font-mono'}
                                        placeholder='{"@context": "https://schema.org", ...}'
                                    />
                                    <FieldError message={errors.schema_markup} />
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className={cardClass}>
                            <div className="space-y-3">
                                <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                                </button>
                                <Link href="/admin/categories" className={buttonSecondaryClass}>
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