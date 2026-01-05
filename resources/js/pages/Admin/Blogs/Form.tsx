import React, { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, Search, Globe, Image as ImageIcon, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

type BlogCategory = { id: number; name: string };

export type BlogFormData = {
    blog_category_id: string | number;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    status: 'draft' | 'published';
    thumbnail?: File | null;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    schema_markup?: string;
    social_image?: File | null;
    social_description?: string;
};

interface BlogFormProps {
    blog?: BlogFormData & { id?: number; thumbnail?: string; social_image?: string };
    categories: BlogCategory[];
    isEdit?: boolean;
}

export default function BlogForm({ blog, categories, isEdit = false }: BlogFormProps) {
    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    const { data, setData, errors, post, put, processing } = useForm<BlogFormData>({
        blog_category_id: blog?.blog_category_id || '',
        title: blog?.title || '',
        slug: blog?.slug || '',
        content: blog?.content || '',
        excerpt: blog?.excerpt || '',
        status: blog?.status || 'draft',
        thumbnail: null,
        meta_title: blog?.meta_title || '',
        meta_description: blog?.meta_description || '',
        meta_keywords: blog?.meta_keywords || '',
        schema_markup: blog?.schema_markup || '',
        social_image: null,
        social_description: blog?.social_description || '',
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEdit && data.title) {
            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setData('slug', slug);
        }
    }, [data.title, isEdit]);

    // Auto-resize content textarea
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
        }
    }, [data.content]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && blog?.id) {
            post(`/admin/blogs/${blog.id}`, {
                forceFormData: true,
                _method: 'PUT',
            });
        } else {
            post('/admin/blogs', {
                forceFormData: true,
            });
        }
    }

    // Save as draft
    function saveAsDraft() {
        setData('status', 'draft');
        setTimeout(() => {
            if (contentRef.current) {
                const form = contentRef.current.form;
                if (form) form.requestSubmit();
            }
        }, 100);
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/blogs"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update your blog content below.' : 'Write and publish your blog post.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content - 2 columns */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5" />
                                        Content
                                    </h3>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full px-4 py-3 text-lg rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter blog post title..."
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                            placeholder="blog-post-slug"
                                            required
                                        />
                                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Excerpt
                                            <span className="text-xs text-gray-500 ml-2">(Max 500 characters)</span>
                                        </label>
                                        <textarea
                                            value={data.excerpt}
                                            onChange={e => setData('excerpt', e.target.value)}
                                            maxLength={500}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Brief summary of the blog post..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.excerpt?.length || 0}/500</p>
                                        {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            ref={contentRef}
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            rows={15}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Write your blog content here... You can use Markdown formatting."
                                        />
                                        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                                    </div>
                                </div>

                                {/* SEO Section */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Search className="w-5 h-5" />
                                        SEO Settings
                                    </h3>

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
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="SEO optimized title"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.meta_title?.length || 0}/60</p>
                                        {errors.meta_title && <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>}
                                    </div>

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
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Brief description for search engines"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.meta_description?.length || 0}/160</p>
                                        {errors.meta_description && <p className="text-red-500 text-xs mt-1">{errors.meta_description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Meta Keywords
                                            <span className="text-xs text-gray-500 ml-2">(Comma separated)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.meta_keywords}
                                            onChange={e => setData('meta_keywords', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="health, wellness, herbs"
                                        />
                                        {errors.meta_keywords && <p className="text-red-500 text-xs mt-1">{errors.meta_keywords}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="space-y-6">
                                {/* Publish Settings */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Publish
                                    </h3>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value as 'draft' | 'published')}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={data.blog_category_id}
                                            onChange={e => setData('blog_category_id', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Uncategorized</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.blog_category_id && <p className="text-red-500 text-xs mt-1">{errors.blog_category_id}</p>}
                                    </div>

                                    {/* Thumbnail */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Featured Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('thumbnail', e.target.files?.[0] || null)}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                        {blog?.thumbnail && !data.thumbnail && (
                                            <div className="mt-2">
                                                <img 
                                                    src={`/storage/${blog.thumbnail}`} 
                                                    alt="Current thumbnail"
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px (Max 2MB)</p>
                                        {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 space-y-2">
                                        {data.status === 'published' ? (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                                            >
                                                <Check size={16} />
                                                {isEdit ? 'Update Post' : 'Publish Post'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                                                >
                                                    <Save size={16} />
                                                    {isEdit ? 'Update Draft' : 'Save Draft'}
                                                </button>
                                            </>
                                        )}
                                        
                                        <Link
                                            href="/admin/blogs"
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                                        >
                                            <ArrowLeft size={16} />
                                            Cancel
                                        </Link>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Globe className="w-5 h-5" />
                                        Social Media
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Social Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('social_image', e.target.files?.[0] || null)}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">1200x630px (Max 2MB)</p>
                                        {errors.social_image && <p className="text-red-500 text-xs mt-1">{errors.social_image}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Social Description
                                            <span className="text-xs text-gray-500 ml-2">(Max 300 chars)</span>
                                        </label>
                                        <textarea
                                            value={data.social_description}
                                            onChange={e => setData('social_description', e.target.value)}
                                            maxLength={300}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="Description for social shares"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.social_description?.length || 0}/300</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}