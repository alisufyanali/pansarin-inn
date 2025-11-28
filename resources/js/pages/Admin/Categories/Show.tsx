import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { can } from '@/lib/can';

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    status: boolean;
    parent?: { id: number; name: string } | null;
    children?: Category[];
    products?: any[];
}

export default function Show({ category }: { category: Category }) {
    const canEdit = can('edit.categories');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/categories' },
        { title: category.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />
            <div className="p-3">
                <div className="flex items-center gap-2 mb-4">
                    <Link
                        href="/categories"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/categories/${category.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
                            title="Edit"
                        >
                            <Edit2 />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category Details */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{category.name}</h1>
                            
                            <div className="space-y-4 mt-4">
                                {/* Slug */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Slug:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{category.slug}</span>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                        category.status 
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                        {category.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Parent Category */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Parent Category:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{category.parent?.name || '-'}</span>
                                </div>

                                {/* Subcategories */}
                                {category.children && category.children.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Subcategories</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {category.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`/categories/${child.id}`}
                                                    className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Products Count */}
                                {category.products && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-green-700 dark:text-green-300">
                                            <strong>{category.products.length}</strong> products in this category
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category Image */}
                    {category.image && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Image</h3>
                            <img 
                                src={category.image} 
                                alt={category.name}
                                className="w-full h-auto rounded-lg object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
