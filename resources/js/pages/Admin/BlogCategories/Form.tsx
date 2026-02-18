import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, FolderTree, Globe, Search, Code } from 'lucide-react';
import { Link } from '@inertiajs/react';

type BlogCategory = { id: number; name: string };

export type BlogCategoryFormData = {
    name: string;
    slug: string;
    parent_id: string | number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    schema_markup?: string;
    social_image?: File | null;
    social_description?: string;
};

interface BlogCategoryFormProps {
    blogCategory?: BlogCategoryFormData & { id?: number };
    parents: BlogCategory[];
    isEdit?: boolean;
}

// Reusable error message component
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-red-500 dark:text-red-400 text-sm mt-1">{message}</p>;
}

export default function BlogCategoryForm({ blogCategory, parents, isEdit = false }: BlogCategoryFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<BlogCategoryFormData>({
        name: blogCategory?.name || '',
        slug: blogCategory?.slug || '',
        parent_id: blogCategory?.parent_id || '',
        meta_title: blogCategory?.meta_title || '',
        meta_description: blogCategory?.meta_description || '',
        meta_keywords: blogCategory?.meta_keywords || '',
        schema_markup: blogCategory?.schema_markup || '',
        social_image: null,
        social_description: blogCategory?.social_description || '',
    });

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEdit && data.name) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setData('slug', slug);
        }
    }, [data.name, isEdit]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && blogCategory?.id) {
            put(`/admin/blogcategories/${blogCategory.id}`);
        } else {
            post('/admin/blogcategories');
        }
    }

    // inputClass — error hone par red border
    const inputClass = (hasError?: string) =>
        `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 transition-colors
        ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
        }`;

    const cardClass = 'bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700';
    const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';
    const subTextClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/blogcategories"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEdit ? 'Edit Category' : 'New Category'}
                </h1>
            </div>

            {/* Global error banner */}
            {(errors as any).error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {(errors as any).error}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Category Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <FolderTree className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Category Details</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={labelClass}>
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={inputClass(errors.name)}
                                        placeholder="e.g., Health & Wellness"
                                        required
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className={labelClass}>
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value)}
                                        className={inputClass(errors.slug)}
                                        placeholder="health-wellness"
                                        required
                                    />
                                    <p className={subTextClass}>
                                        Auto-generated from name. Use lowercase letters, numbers, and hyphens only.
                                    </p>
                                    <FieldError message={errors.slug} />
                                </div>

                                {/* Parent Category */}
                                <div>
                                    <label className={labelClass}>Parent Category</label>
                                    <select
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                        className={inputClass(errors.parent_id)}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {parents.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError message={errors.parent_id} />
                                </div>
                            </div>
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
                                    <div className={`border-2 border-dashed rounded-lg p-3 transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                        ${errors.social_image
                                            ? 'border-red-400 dark:border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('social_image', e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="social_image"
                                        />
                                        <label htmlFor="social_image" className="cursor-pointer block text-center">
                                            <div className="py-2">
                                                <div className="w-8 h-8 mx-auto bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mb-1">
                                                    <Globe className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Upload social image</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1200x630px</p>
                                            </div>
                                        </label>
                                    </div>
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

                    {/* Right Column - SEO & Social */}
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
                                        placeholder="Brief description"
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
                                        placeholder="health, wellness, herbs"
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
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                                </button>

                                <Link
                                    href="/admin/blogcategories"
                                    className="block w-full text-center border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
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