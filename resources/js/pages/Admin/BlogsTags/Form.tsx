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
            put(`/admin/blogstags/${initialData.id}`);
        } else {
            post('/admin/blogstags');
        }
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/blogstags"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Tag' : 'New Tag'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Tag Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Tag className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Tag Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tag Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., Technology, Tutorial"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Slug <span className="text-xs text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Auto-generated from name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty to auto-generate
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Description <span className="text-xs text-gray-500">(max 500 chars)</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Brief description of this tag..."
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.description?.length || 0}/500 characters
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Color & Settings */}
                    <div className="space-y-6">
                        {/* Color Picker */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Color</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Choose a color</label>
                                    <div className="grid grid-cols-5 gap-2 mb-4">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setData('color', color)}
                                                className={`h-8 w-8 rounded transition-all ${
                                                    data.color === color
                                                        ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
                                                        : 'hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="h-10 w-12 cursor-pointer rounded border"
                                        />
                                        <input
                                            type="text"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                </div>

                                {/* Color Preview */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm font-medium mb-2">Preview</p>
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded"
                                            style={{ backgroundColor: data.color }}
                                        />
                                        <span 
                                            className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: data.color }}
                                        >
                                            {data.name || 'Tag Name'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="font-semibold text-lg mb-4">Settings</h3>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Active Status</label>
                                    <p className="text-xs text-gray-500">Show this tag in lists</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
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
                                    {processing ? 'Saving...' : (isEdit ? 'Update Tag' : 'Create Tag')}
                                </button>
                                
                                <Link
                                    href="/admin/blogstags"
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