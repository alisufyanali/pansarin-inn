import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
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
                // @ts-ignore
                method: 'put',
            });
        } else {
            post('/admin/categories', {
                forceFormData: true,
            });
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update the category details below.' : 'Fill the form below to add a new category.'}
                    </p>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Parent Category (optional)
                            </label>
                            <select
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">No parent (root category)</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.parent_id && <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Category Image
                            </label>
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            PNG, JPG or GIF (MAX. 2MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={e => setData('status', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Status
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="/admin/categories"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                            >
                                <ArrowLeft size={16} />
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEdit ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        {isEdit ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}