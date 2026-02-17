import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Palette, Tag } from 'lucide-react';
import React from 'react';

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
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-red-500 dark:text-red-400 text-sm mt-1">{message}</p>;
}

export default function Form({ initialData, isEdit = false }: BlogTagFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<BlogTagFormData>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        color: initialData?.color || '#3B82F6',
        is_active: initialData?.is_active ?? true,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && initialData?.id) {
            put(`/admin/blogtags/${initialData.id}`);
        } else {
            post('/admin/blogtags');
        }
    }

    const inputClass = (hasError?: string) =>
        `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 transition-colors
        ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
        }`;

    const cardClass = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6';
    const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';

    return (
        <div className="p-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/blogtags"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isEdit ? 'Edit Tag' : 'New Tag'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Tag Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Tag Details</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={labelClass}>
                                        Tag Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={inputClass(errors.name)}
                                        placeholder="e.g., Technology, Tutorial"
                                        required
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className={labelClass}>
                                        Slug{' '}
                                        <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className={inputClass(errors.slug)}
                                        placeholder="Auto-generated from name"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Leave empty to auto-generate
                                    </p>
                                    <FieldError message={errors.slug} />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>
                                        Description{' '}
                                        <span className="text-xs text-gray-400 dark:text-gray-500">(max 500 chars)</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className={inputClass(errors.description)}
                                        placeholder="Brief description of this tag..."
                                    />
                                    <div className="flex justify-between mt-1">
                                        <FieldError message={errors.description} />
                                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                            {data.description?.length || 0}/500
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Color Picker */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Color</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Swatches */}
                                <div>
                                    <label className={labelClass}>Choose a color</label>
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setData('color', color)}
                                                className={`h-8 w-8 rounded transition-all ${
                                                    data.color === color
                                                        ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-110'
                                                        : 'hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>

                                    {/* Custom color + hex */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="h-10 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        />
                                        <input
                                            type="text"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className={inputClass(errors.color) + ' font-mono text-sm'}
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                    <FieldError message={errors.color} />
                                </div>

                                {/* Preview */}
                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preview</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-7 h-7 rounded"
                                            style={{ backgroundColor: data.color }}
                                        />
                                        <span
                                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: data.color }}
                                        >
                                            {data.name || 'Tag Name'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className={cardClass}>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Settings</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Show this tag in lists</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
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
                                    {processing ? 'Saving...' : isEdit ? 'Update Tag' : 'Create Tag'}
                                </button>
                                <Link
                                    href="/admin/blogtags"
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