import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, Globe, Search, Code } from 'lucide-react';
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

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/blogcategories"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Blog Category' : 'Create New Blog Category'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update the blog category details below.' : 'Fill the form below to add a new blog category.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., Health & Wellness"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="health-wellness"
                                        required
                                    />
                                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                </div>
                            </div>

                            {/* Parent Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Parent Category
                                </label>
                                <select
                                    value={data.parent_id}
                                    onChange={e => setData('parent_id', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">None (Root Category)</option>
                                    {parents.map(parent => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.parent_id && <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>}
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5" />
                                SEO Settings
                            </h3>

                            {/* Meta Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Title
                                    <span className="text-xs text-gray-500 ml-2">(Max 60 characters)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.meta_title}
                                    onChange={e => setData('meta_title', e.target.value)}
                                    maxLength={60}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="SEO optimized title"
                                />
                                <p className="text-xs text-gray-500 mt-1">{data.meta_title?.length || 0}/60</p>
                                {errors.meta_title && <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>}
                            </div>

                            {/* Meta Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Description
                                    <span className="text-xs text-gray-500 ml-2">(Max 160 characters)</span>
                                </label>
                                <textarea
                                    value={data.meta_description}
                                    onChange={e => setData('meta_description', e.target.value)}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Brief description for search engines"
                                />
                                <p className="text-xs text-gray-500 mt-1">{data.meta_description?.length || 0}/160</p>
                                {errors.meta_description && <p className="text-red-500 text-xs mt-1">{errors.meta_description}</p>}
                            </div>

                            {/* Meta Keywords */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Meta Keywords
                                    <span className="text-xs text-gray-500 ml-2">(Comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.meta_keywords}
                                    onChange={e => setData('meta_keywords', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="health, wellness, herbs"
                                />
                                {errors.meta_keywords && <p className="text-red-500 text-xs mt-1">{errors.meta_keywords}</p>}
                            </div>

                            {/* Schema Markup */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Schema Markup (JSON-LD)
                                </label>
                                <textarea
                                    value={data.schema_markup}
                                    onChange={e => setData('schema_markup', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    placeholder='{"@context": "https://schema.org", ...}'
                                />
                                {errors.schema_markup && <p className="text-red-500 text-xs mt-1">{errors.schema_markup}</p>}
                            </div>
                        </div>

                        {/* Social Media Section */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5" />
                                Social Media
                            </h3>

                            {/* Social Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Social Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setData('social_image', e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px (Max 2MB)</p>
                                {errors.social_image && <p className="text-red-500 text-xs mt-1">{errors.social_image}</p>}
                            </div>

                            {/* Social Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Social Description
                                    <span className="text-xs text-gray-500 ml-2">(Max 300 characters)</span>
                                </label>
                                <textarea
                                    value={data.social_description}
                                    onChange={e => setData('social_description', e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Description for social media shares"
                                />
                                <p className="text-xs text-gray-500 mt-1">{data.social_description?.length || 0}/300</p>
                                {errors.social_description && <p className="text-red-500 text-xs mt-1">{errors.social_description}</p>}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="/admin/blogcategories"
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                            >
                                <ArrowLeft size={16} />
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                            >
                                <Check size={16} />
                                {isEdit ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}