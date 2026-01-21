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

    const handleSocialImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEdit && initialData?.id) {
            post(`/admin/blogs/${initialData.id}`, {
                forceFormData: true,
                method: 'put' as any,
            });
        } else {
            post('/admin/blogs', {
                forceFormData: true,
            });
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/blogs"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
                    </h1>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-lg border p-4">
                            <h3 className="font-semibold text-lg mb-4">Content</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Blog post title"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="auto-generated-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Content</label>
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={10}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Write your content here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Excerpt <span className="text-gray-500 text-sm">(max 500 chars)</span>
                                    </label>
                                    <textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Brief summary..."
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.excerpt?.length || 0}/500 characters
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Card */}
                        <div className="bg-white rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-4 h-4" />
                                <h3 className="font-semibold text-lg">SEO Settings</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        maxLength={60}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="SEO title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        maxLength={160}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="SEO description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Keywords</label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Settings Card */}
                        <div className="bg-white rounded-lg border p-4">
                            <h3 className="font-semibold text-lg mb-4">Settings</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={data.blog_category_id || ''}
                                        onChange={(e) => setData('blog_category_id', e.target.value ? Number(e.target.value) : null)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Featured Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                            id="thumbnail"
                                        />
                                        <label htmlFor="thumbnail" className="cursor-pointer">
                                            {thumbnailPreview ? (
                                                <img 
                                                    src={thumbnailPreview} 
                                                    alt="Thumbnail" 
                                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                                />
                                            ) : (
                                                <div className="py-8">
                                                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                                    <p className="text-xs text-gray-500 mt-1">1200x630px recommended</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tags Card */}
                        <div className="bg-white rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TagIcon className="w-4 h-4" />
                                <h3 className="font-semibold text-lg">Tags</h3>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedTags.includes(tag.id)
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                            
                            {tags.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    No tags available
                                </div>
                            )}
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-4 h-4" />
                                <h3 className="font-semibold text-lg">Social Media</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Social Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSocialImageChange}
                                            className="hidden"
                                            id="social_image"
                                        />
                                        <label htmlFor="social_image" className="cursor-pointer">
                                            {socialImagePreview ? (
                                                <img 
                                                    src={socialImagePreview} 
                                                    alt="Social" 
                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                />
                                            ) : (
                                                <div className="py-6">
                                                    <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">Upload for social sharing</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Social Description</label>
                                    <textarea
                                        value={data.social_description}
                                        onChange={(e) => setData('social_description', e.target.value)}
                                        maxLength={300}
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Description for social shares"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg border p-4">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : data.status === 'published' ? 'Publish' : 'Save Draft'}
                                </button>
                                
                                <Link
                                    href="/admin/blogs"
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