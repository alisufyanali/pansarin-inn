import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X, Folder } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Category = { id: number; name: string };

export type CategoryFormData = {
    name: string;
    parent_id: string | number;
    image: File | null;
    status: boolean;
};

interface CategoryFormProps {
    category?: CategoryFormData & { id?: number; image?: string };
    categories: Category[];
    isEdit?: boolean;
}

export default function CategoryForm({ category, categories, isEdit = false }: CategoryFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        category?.image ? `/storage/${category.image}` : null
    );

    const { data, setData, errors, post, processing } = useForm<CategoryFormData>({
        name: category?.name || '',
        parent_id: category?.parent_id || '',
        image: null,
        status: category?.status ?? true,
    });

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

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && category?.id) {
            post(`/admin/categories/${category.id}`, {
                forceFormData: true,
                method: 'put' as any,
            });
        } else {
            post('/admin/categories', {
                forceFormData: true,
            });
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Category' : 'New Category'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Folder className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-lg">Category Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Parent Category</label>
                            <select
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">None (Main Category)</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="font-semibold text-lg mb-4">Category Image</h3>
                    
                    <div className="space-y-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-64 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="category_image"
                                />
                                <label htmlFor="category_image" className="cursor-pointer">
                                    <div className="py-6">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600 mb-1">
                                            Click to upload image
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF (Max 2MB)
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}
                        
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium mb-1">Active Status</label>
                                <p className="text-xs text-gray-500">Show this category to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.status}
                                    onChange={e => setData('status', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Link
                                href="/admin/categories"
                                className="flex-1 text-center border py-2.5 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}