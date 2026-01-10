import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Palette, Save, Tag } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

export type BlogTagFormData = {
    name: string;
    slug?: string;
    description?: string;
    color: string;
    is_active: boolean;
};

interface BlogTagFormProps {
    initialData?: BlogTagFormData & { id?: number };
    isEdit?: boolean;
}

const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#84CC16', // Lime
];

export default function Form({
    initialData,
    isEdit = false,
}: BlogTagFormProps) {
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const { data, setData, errors, post, put, processing } =
        useForm<BlogTagFormData>({
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            color: initialData?.color || '#3B82F6',
            is_active: initialData?.is_active ?? true,
        });

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height =
                descriptionRef.current.scrollHeight + 'px';
        }
    }, [data.description]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (isEdit && initialData?.id) {
        put(`/admin/blogstags/${initialData.id}`); // CHANGED
    } else {
        post('/admin/blogstags'); // CHANGED
    }
}

    return (
        <div className="p-3">
            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/admin/blogstags" // FIXED
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-2 text-center text-2xl font-semibold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Blog Tag' : 'Create New Tag'}
                    </h2>
                    <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isEdit
                            ? 'Update the tag details below.'
                            : 'Add a new tag to organize your blog posts.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Content - 2 columns */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Basic Information */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <Tag className="h-5 w-5" />
                                        Tag Details
                                    </h3>

                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Tag Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="e.g., Technology, Tutorial, News..."
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.name}
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
                                            placeholder="Auto-generated from name"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Leave empty to auto-generate from
                                            tag name
                                        </p>
                                        {errors.slug && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Description (Optional)
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Max 500 characters)
                                            </span>
                                        </label>
                                        <textarea
                                            ref={descriptionRef}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={500}
                                            rows={4}
                                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Brief description of what this tag represents..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.description?.length || 0}/500
                                        </p>
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="space-y-6">
                                {/* Settings */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Settings
                                    </h3>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="mb-2 block flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Palette className="h-4 w-4" />
                                            Tag Color
                                        </label>

                                        {/* Predefined Colors */}
                                        <div className="mb-3 grid grid-cols-5 gap-2">
                                            {predefinedColors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() =>
                                                        setData('color', color)
                                                    }
                                                    className={`h-10 w-10 rounded-lg transition-all ${
                                                        data.color === color
                                                            ? 'scale-110 ring-2 ring-blue-500 ring-offset-2'
                                                            : 'hover:scale-105'
                                                    }`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>

                                        {/* Custom Color Input */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={data.color}
                                                onChange={(e) =>
                                                    setData(
                                                        'color',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                                            />
                                            <input
                                                type="text"
                                                value={data.color}
                                                onChange={(e) =>
                                                    setData(
                                                        'color',
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                placeholder="#3B82F6"
                                            />
                                        </div>

                                        {/* Preview */}
                                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                            <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                                                Preview:
                                            </p>
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white"
                                                style={{
                                                    backgroundColor: data.color,
                                                }}
                                            >
                                                <span className="h-2 w-2 rounded-full bg-white"></span>
                                                {data.name || 'Tag Name'}
                                            </span>
                                        </div>
                                        {errors.color && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.color}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="flex cursor-pointer items-center justify-between">
                                            <div>
                                                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Active Status
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Make this tag available for
                                                    use
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) =>
                                                    setData(
                                                        'is_active',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </label>
                                        {errors.is_active && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.is_active}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg
                                                        className="h-4 w-4 animate-spin"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    {isEdit
                                                        ? 'Updating...'
                                                        : 'Creating...'}
                                                </>
                                            ) : (
                                                <>
                                                    {data.is_active ? (
                                                        <Check size={16} />
                                                    ) : (
                                                        <Save size={16} />
                                                    )}
                                                    {isEdit
                                                        ? 'Update Tag'
                                                        : 'Create Tag'}
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            href="/admin/blogstags" // FIXED
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <ArrowLeft size={16} />
                                            Cancel
                                        </Link>
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                                        Tag Guidelines
                                    </h4>
                                    <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
                                        <li>
                                            • Keep tags specific and relevant
                                        </li>
                                        <li>
                                            • Use consistent naming conventions
                                        </li>
                                        <li>
                                            • One blog can have multiple tags
                                        </li>
                                        <li>
                                            • Tags help users find related
                                            content
                                        </li>
                                        <li>
                                            • Choose colors that match your
                                            theme
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
