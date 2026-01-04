import React, { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Image as ImageIcon, Link as LinkIcon, Layout, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

export type FrontendFormData = {
    type: 'carousel' | 'banner';
    title?: string;
    order?: number;
    is_active: boolean;
    link?: string;
    description?: string;
    image?: File | null;
};

interface FrontendFormProps {
    initialData?: FrontendFormData & { id?: number; image?: string };
    isEdit?: boolean;
}

export default function Form({ initialData, isEdit = false }: FrontendFormProps) {
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(
        initialData?.image ? `/storage/${initialData.image}` : null
    );
    
    const { data, setData, errors, post, processing } = useForm<FrontendFormData>({
        type: initialData?.type || 'carousel',
        title: initialData?.title || '',
        order: initialData?.order || 0,
        is_active: initialData?.is_active ?? true,
        link: initialData?.link || '',
        description: initialData?.description || '',
        image: null,
    });

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
        }
    }, [data.description]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && initialData?.id) {
            post(`/admin/frontend/${initialData.id}`, {
                forceFormData: true,
                method: 'put',
            });
        } else {
            post('/admin/frontend', {
                forceFormData: true,
            });
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/frontend"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Frontend Content' : 'Create New Content'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update your content below.' : 'Add new carousel or banner content.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content - 2 columns */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Layout className="w-5 h-5" />
                                        Content Details
                                    </h3>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full px-4 py-3 text-lg rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter content title..."
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Type *
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value as 'carousel' | 'banner')}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        >
                                            <option value="carousel">Carousel</option>
                                            <option value="banner">Banner</option>
                                        </select>
                                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                    </div>

                                    {/* Link */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Link URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.link}
                                            onChange={e => setData('link', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://example.com"
                                        />
                                        {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                            <span className="text-xs text-gray-500 ml-2">(Max 1000 characters)</span>
                                        </label>
                                        <textarea
                                            ref={descriptionRef}
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            maxLength={1000}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Brief description of the content..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{data.description?.length || 0}/1000</p>
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="space-y-6">
                                {/* Publish Settings */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Settings
                                    </h3>

                                    {/* Order */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.order}
                                            onChange={e => setData('order', Number(e.target.value))}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                        {errors.order && <p className="text-red-500 text-xs mt-1">{errors.order}</p>}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Active Status
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Make this content visible
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={e => setData('is_active', e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </label>
                                        {errors.is_active && <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>}
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Image {!isEdit && '*'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            onChange={handleImageChange}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview"
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Accepted: JPEG, PNG, JPG, GIF, WEBP (Max 2MB)
                                        </p>
                                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 space-y-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                                        >
                                            {data.is_active ? <Check size={16} /> : <Save size={16} />}
                                            {isEdit ? 'Update Content' : 'Create Content'}
                                        </button>
                                        
                                        <Link
                                            href="/admin/frontend"
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                                        >
                                            <ArrowLeft size={16} />
                                            Cancel
                                        </Link>
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