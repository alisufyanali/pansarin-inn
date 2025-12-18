import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Category = { id: number; name: string };

export type CategoryFormData = {
    name: string;
    parent_id: string | number;
    image: File | string;
    status: boolean;
};

interface CategoryFormProps {
    category?: CategoryFormData & { id?: number; image?: string };
    categories: Category[];
    isEdit?: boolean;
}

export default function CategoryForm({ category, categories, isEdit = false }: CategoryFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<CategoryFormData>({
        name: category?.name || '',
        parent_id: category?.parent_id || '',
        image: '',
        status: category?.status ?? true,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && category?.id) {
            put(`/admin/categories/${category.id}`);
        } else {
            post('/admin/categories');
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                    title="Back"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
                        {isEdit ? 'Update the category details below.' : 'Fill the form below to add a new category.'}
                    </p>

                    <form onSubmit={submit} className="space-y-4 font-sans text-sm">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name *</label>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Category (optional)</label>
                            <select
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">No parent (root category)</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.parent_id && <div className="text-red-500 text-sm mt-1">{errors.parent_id}</div>}
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Image</label>
                            <div className="mt-1 relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setData('image', file);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {category?.image && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Current image: {typeof category.image === 'string' ? category.image : 'New file selected'}
                                    </p>
                                )}
                            </div>
                            {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={e => setData('status', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-blue-600 focus:ring-2"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status (Active)</label>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end items-center gap-2 pt-4">
                            <Link
                                href="/admin/categories"
                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                                title="Cancel"
                            >
                                <ArrowLeft />
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white w-10 h-10 shadow"
                                title={isEdit ? 'Update' : 'Create'}
                            >
                                <Check />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
