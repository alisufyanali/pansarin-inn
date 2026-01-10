import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    FileText,
    Globe,
    Save,
    Search,
    Tag as TagIcon,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
};

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    color: string;
    tags: BlogTag[];
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

export default function BlogForm({
    initialData,
    isEdit = false,
    categories = [],
    tags = [],
}: BlogFormProps) {
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const excerptRef = useRef<HTMLTextAreaElement>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialData?.thumbnail ? `/storage/${initialData.thumbnail}` : null,
    );
    const [socialImagePreview, setSocialImagePreview] = useState<string | null>(
        initialData?.social_image
            ? `/storage/${initialData.social_image}`
            : null,
    );

    const [selectedTags, setSelectedTags] = useState<number[]>(
        initialData?.tags?.map((t: BlogTag) => t.id) ?? [],
    );

    const { data, setData, errors, post, processing } = useForm<BlogFormData>({
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

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height =
                contentRef.current.scrollHeight + 'px';
        }
    }, [data.content]);

    useEffect(() => {
        if (excerptRef.current) {
            excerptRef.current.style.height = 'auto';
            excerptRef.current.style.height =
                excerptRef.current.scrollHeight + 'px';
        }
    }, [data.excerpt]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSocialImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('social_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSocialImagePreview(reader.result as string);
            };
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

    const removeTag = (tagId: number) => {
        const newSelectedTags = selectedTags.filter((id) => id !== tagId);
        setSelectedTags(newSelectedTags);
        setData('tags', newSelectedTags);
    };

    const getTagById = (tagId: number) => {
        return tags.find((t) => t.id === tagId);
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEdit && initialData?.id) {
            post(`/admin/blogs/${initialData.id}`, {
                forceFormData: true,
                // @ts-ignore
                method: 'put',
            });
        } else {
            post('/admin/blogs', {
                forceFormData: true,
            });
        }
    }

    return (
        <div className="p-3">
            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/admin/blogs"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-2 text-center text-2xl font-semibold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h2>
                    <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isEdit
                            ? 'Update your blog post content.'
                            : 'Create engaging content for your audience.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Content - 2 columns */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Basic Information */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <FileText className="h-5 w-5" />
                                        Content Details
                                    </h3>

                                    {/* Title */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Enter blog post title..."
                                            required
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Slug (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Auto-generated from title"
                                        />
                                        {errors.slug && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Content
                                        </label>
                                        <textarea
                                            ref={contentRef}
                                            value={data.content}
                                            onChange={(e) =>
                                                setData(
                                                    'content',
                                                    e.target.value,
                                                )
                                            }
                                            rows={12}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Write your blog content here..."
                                        />
                                        {errors.content && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Excerpt
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Max 500 characters)
                                            </span>
                                        </label>
                                        <textarea
                                            ref={excerptRef}
                                            value={data.excerpt}
                                            onChange={(e) =>
                                                setData(
                                                    'excerpt',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={500}
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Brief summary of your blog post..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.excerpt?.length || 0}/500
                                        </p>
                                        {errors.excerpt && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <TagIcon className="h-5 w-5" />
                                        Tags
                                    </h3>

                                    {/* Selected Tags */}
                                    {selectedTags.length > 0 && (
                                        <div className="mb-4">
                                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Selected Tags (
                                                {selectedTags.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTags.map((tagId) => {
                                                    const tag =
                                                        getTagById(tagId);
                                                    if (!tag) return null;
                                                    return (
                                                        <span
                                                            key={tag.id}
                                                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white"
                                                            style={{
                                                                backgroundColor:
                                                                    tag.color,
                                                            }}
                                                        >
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeTag(
                                                                        tag.id,
                                                                    )
                                                                }
                                                                className="rounded-full p-0.5 transition hover:bg-white/20"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Available Tags */}
                                    <div>
                                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Available Tags
                                        </p>
                                        {tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleTag(tag.id)
                                                        }
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                                                            selectedTags.includes(
                                                                tag.id,
                                                            )
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : 'hover:scale-105'
                                                        }`}
                                                        style={{
                                                            backgroundColor:
                                                                selectedTags.includes(
                                                                    tag.id,
                                                                )
                                                                    ? '#E5E7EB'
                                                                    : tag.color,
                                                            color: selectedTags.includes(
                                                                tag.id,
                                                            )
                                                                ? '#6B7280'
                                                                : '#FFFFFF',
                                                        }}
                                                        disabled={selectedTags.includes(
                                                            tag.id,
                                                        )}
                                                    >
                                                        {selectedTags.includes(
                                                            tag.id,
                                                        ) && (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                        {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800">
                                                <TagIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                                <p className="mb-3 text-gray-600 dark:text-gray-400">
                                                    No tags available yet.
                                                </p>
                                                <Link
    href="/admin/blogstags/create" // FIXED - lowercase 's' before 'tags'
    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
>
    <TagIcon className="h-4 w-4" />
    Create First Tag
</Link>
                                            </div>
                                        )}
                                    </div>
                                    {errors.tags && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.tags}
                                        </p>
                                    )}
                                </div>

                                {/* SEO Section */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <Search className="h-5 w-5" />
                                        SEO Settings
                                    </h3>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Meta Title
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Max 60 characters)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.meta_title}
                                            onChange={(e) =>
                                                setData(
                                                    'meta_title',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={60}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="SEO optimized title"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.meta_title?.length || 0}/60
                                        </p>
                                        {errors.meta_title && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.meta_title}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Meta Description
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Max 160 characters)
                                            </span>
                                        </label>
                                        <textarea
                                            value={data.meta_description}
                                            onChange={(e) =>
                                                setData(
                                                    'meta_description',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={160}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Brief description for search engines"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.meta_description?.length || 0}
                                            /160
                                        </p>
                                        {errors.meta_description && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.meta_description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Meta Keywords
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Comma separated)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.meta_keywords}
                                            onChange={(e) =>
                                                setData(
                                                    'meta_keywords',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                        {errors.meta_keywords && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.meta_keywords}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="space-y-6">
                                {/* Publish Settings */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Settings
                                    </h3>

                                    {/* Category */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Category
                                        </label>
                                        <select
                                            value={data.blog_category_id || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'blog_category_id',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">
                                                Select category...
                                            </option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.blog_category_id && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.blog_category_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    'status',
                                                    e.target.value as
                                                        | 'draft'
                                                        | 'published',
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">
                                                Published
                                            </option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Thumbnail */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Featured Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                        {thumbnailPreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Recommended: 1200x630px (Max 2MB)
                                        </p>
                                        {errors.thumbnail && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.thumbnail}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                                        >
                                            {data.status === 'published' ? (
                                                <>
                                                    <Check size={16} />
                                                    {isEdit
                                                        ? 'Update Post'
                                                        : 'Publish Post'}
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    {isEdit
                                                        ? 'Update Draft'
                                                        : 'Save Draft'}
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            href="/admin/blogs"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <ArrowLeft size={16} />
                                            Cancel
                                        </Link>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <Globe className="h-5 w-5" />
                                        Social Media
                                    </h3>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Social Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSocialImageChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                        {socialImagePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={socialImagePreview}
                                                    alt="Social image preview"
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            1200x630px (Max 2MB)
                                        </p>
                                        {errors.social_image && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.social_image}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Social Description
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Max 300 chars)
                                            </span>
                                        </label>
                                        <textarea
                                            value={data.social_description}
                                            onChange={(e) =>
                                                setData(
                                                    'social_description',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={300}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Description for social shares"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.social_description?.length ||
                                                0}
                                            /300
                                        </p>
                                        {errors.social_description && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.social_description}
                                            </p>
                                        )}
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
