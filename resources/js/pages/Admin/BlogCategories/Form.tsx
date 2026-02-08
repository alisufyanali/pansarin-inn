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
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/blogcategories"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Category' : 'New Category'}
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Category Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FolderTree className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Category Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., Health & Wellness"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="health-wellness"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Auto-generated from name. Use lowercase letters, numbers, and hyphens only.
                                    </p>
                                    {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Parent Category</label>
                                    <select
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="">None (Main Category)</option>
                                        {parents.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - SEO & Social */}
                    <div className="space-y-6">
                        {/* SEO Settings */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">SEO Settings</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Meta Title <span className="text-xs text-gray-500">(max 60)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={e => setData('meta_title', e.target.value)}
                                        maxLength={60}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="SEO optimized title"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.meta_title?.length || 0}/60
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Meta Description <span className="text-xs text-gray-500">(max 160)</span>
                                    </label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        maxLength={160}
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="Brief description"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.meta_description?.length || 0}/160
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Keywords</label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={e => setData('meta_keywords', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="health, wellness, herbs"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code className="w-4 h-4 text-gray-600" />
                                        <label className="block text-sm font-medium">
                                            Schema Markup
                                        </label>
                                    </div>
                                    <textarea
                                        value={data.schema_markup}
                                        onChange={e => setData('schema_markup', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                        placeholder='{"@context": "https://schema.org", ...}'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Social Media</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Social Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('social_image', e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="social_image"
                                        />
                                        <label htmlFor="social_image" className="cursor-pointer block text-center">
                                            <div className="py-2">
                                                <div className="w-8 h-8 mx-auto bg-gray-100 rounded flex items-center justify-center mb-1">
                                                    <Globe className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <p className="text-xs text-gray-600">Upload social image</p>
                                                <p className="text-xs text-gray-500 mt-1">1200x630px</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Social Description <span className="text-xs text-gray-500">(max 300)</span>
                                    </label>
                                    <textarea
                                        value={data.social_description}
                                        onChange={e => setData('social_description', e.target.value)}
                                        maxLength={300}
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder="Social media description"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.social_description?.length || 0}/300
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
                                </button>
                                
                                <Link
                                    href="/admin/blogcategories"
                                    className="block w-full text-center border py-2.5 rounded-lg hover:bg-gray-50"
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