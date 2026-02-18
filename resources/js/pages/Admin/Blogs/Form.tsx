import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Image as ImageIcon, Tag as TagIcon, Globe, Search } from 'lucide-react';
import React, { useState } from 'react';

export type BlogFormData = {
    blog_category_id?: number | null;
    title: string;
    slug?: string;
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
    tags?: number[];
    error?: string; // global error ke liye
};

interface BlogTag {
    id: number;
    name: string;
    color: string;
}

interface BlogCategory {
    id: number;
    name: string;
}

interface BlogFormProps {
    initialData?: BlogFormData & {
        id?: number;
        thumbnail?: string;
        social_image?: string;
        tags?: BlogTag[];
    };
    isEdit?: boolean;
    categories?: BlogCategory[];
    tags?: BlogTag[];
}

// Reusable error message component
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-red-500 dark:text-red-400 text-sm mt-1">{message}</p>;
}

export default function BlogForm({
    initialData,
    isEdit = false,
    categories = [],
    tags = [],
}: BlogFormProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialData?.thumbnail ? `/storage/${initialData.thumbnail}` : null,
    );
    const [socialImagePreview, setSocialImagePreview] = useState<string | null>(
        initialData?.social_image ? `/storage/${initialData.social_image}` : null,
    );
    const [selectedTags, setSelectedTags] = useState<number[]>(
        initialData?.tags?.map((t: BlogTag) => t.id) ?? [],
    );

    const { data, setData, errors, post, put, processing } = useForm<BlogFormData>({
        blog_category_id: initialData?.blog_category_id || null,
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        content: initialData?.content || '',
        excerpt: initialData?.excerpt || '',
        status: initialData?.status || 'draft',
        thumbnail: null,
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || '',
        meta_keywords: initialData?.meta_keywords || '',
        schema_markup: initialData?.schema_markup || '',
        social_image: null,
        social_description: initialData?.social_description || '',
        tags: initialData?.tags?.map((t: BlogTag) => t.id) || [],
    });

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
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

    const toggleTag = (tagId: number) => {
        const newSelectedTags = selectedTags.includes(tagId)
            ? selectedTags.filter((id) => id !== tagId)
            : [...selectedTags, tagId];
        setSelectedTags(newSelectedTags);
        setData('tags', newSelectedTags);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEdit && initialData?.id) {
            post(`/admin/blogs/${initialData.id}`, {  // POST to /admin/blogs/{id}
                forceFormData: true,
            });
        } else {
            post('/admin/blogs', { forceFormData: true });
        }
    };

    // inputClass — error hone par red border dikhata hai
    const inputClass = (hasError?: string) =>
        `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 transition-colors
        ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
        }`;

    const cardClass = 'bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700';
    const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/blogs"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
                    </h1>
                </div>
            </div>

            {/* Global error banner (catch block se aane wala generic error) */}
            {errors.error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {errors.error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Content Card */}
                        <div className={cardClass}>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Content</h3>
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className={labelClass}>Title *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={inputClass(errors.title)}
                                        placeholder="Blog post title"
                                        required
                                    />
                                    <FieldError message={errors.title} />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className={labelClass}>Slug</label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className={inputClass(errors.slug)}
                                        placeholder="auto-generated-slug"
                                    />
                                    <FieldError message={errors.slug} />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className={labelClass}>Content</label>
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={10}
                                        className={inputClass(errors.content)}
                                        placeholder="Write your content here..."
                                    />
                                    <FieldError message={errors.content} />
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className={labelClass}>
                                        Excerpt{' '}
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">(max 500 chars)</span>
                                    </label>
                                    <textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className={inputClass(errors.excerpt)}
                                        placeholder="Brief summary..."
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError message={errors.excerpt} />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                            {data.excerpt?.length || 0}/500
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Card */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">SEO Settings</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Meta Title</label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        maxLength={60}
                                        className={inputClass(errors.meta_title)}
                                        placeholder="SEO title"
                                    />
                                    <FieldError message={errors.meta_title} />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta Description</label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        maxLength={160}
                                        rows={3}
                                        className={inputClass(errors.meta_description)}
                                        placeholder="SEO description"
                                    />
                                    <FieldError message={errors.meta_description} />
                                </div>
                                <div>
                                    <label className={labelClass}>Keywords</label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        className={inputClass(errors.meta_keywords)}
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                    <FieldError message={errors.meta_keywords} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Settings Card */}
                        <div className={cardClass}>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <select
                                        value={data.blog_category_id || ''}
                                        onChange={(e) =>
                                            setData('blog_category_id', e.target.value ? Number(e.target.value) : null)
                                        }
                                        className={inputClass(errors.blog_category_id)}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError message={errors.blog_category_id} />
                                </div>

                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value as 'draft' | 'published')
                                        }
                                        className={inputClass(errors.status)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                    <FieldError message={errors.status} />
                                </div>

                                {/* Thumbnail */}
                                <div>
                                    <label className={labelClass}>Featured Image</label>
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                        ${errors.thumbnail ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            id="thumbnail"
                                        />
                                        <label htmlFor="thumbnail" className="cursor-pointer">
                                            {thumbnailPreview ? (
                                                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg mb-2" />
                                            ) : (
                                                <div className="py-8">
                                                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload image</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1200x630px recommended</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <FieldError message={errors.thumbnail} />
                                </div>
                            </div>
                        </div>

                        {/* Tags Card */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <TagIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Tags</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag.id)
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                            {tags.length === 0 && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">No tags available</div>
                            )}
                            <FieldError message={errors.tags} />
                        </div>

                        {/* Social Media Card */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Social Media</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Social Image</label>
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500
                                        ${errors.social_image ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSocialImageChange}
                                            className="hidden"
                                            id="social_image"
                                        />
                                        <label htmlFor="social_image" className="cursor-pointer">
                                            {socialImagePreview ? (
                                                <img src={socialImagePreview} alt="Social" className="w-full h-32 object-cover rounded-lg mb-2" />
                                            ) : (
                                                <div className="py-6">
                                                    <ImageIcon className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Upload for social sharing</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <FieldError message={errors.social_image} />
                                </div>
                                <div>
                                    <label className={labelClass}>Social Description</label>
                                    <textarea
                                        value={data.social_description}
                                        onChange={(e) => setData('social_description', e.target.value)}
                                        maxLength={300}
                                        rows={2}
                                        className={inputClass(errors.social_description)}
                                        placeholder="Description for social shares"
                                    />
                                    <FieldError message={errors.social_description} />
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
                                    {processing ? 'Saving...' : data.status === 'published' ? 'Publish' : 'Save Draft'}
                                </button>
                                <Link
                                    href="/admin/blogs"
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