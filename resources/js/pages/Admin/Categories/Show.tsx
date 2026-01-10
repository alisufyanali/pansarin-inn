import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2 } from 'lucide-react';

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
                <div className="mb-4 flex items-center gap-2">
                    <Link
                        href="/admin/categories"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/categories/${category.id}/edit`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            title="Edit"
                        >
                            <Edit2 />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Category Details */}
                    <div className="md:col-span-2">
                        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                                {category.name}
                            </h1>

                            <div className="mt-4 space-y-4">
                                {/* Slug */}
                                <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Slug:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {category.slug}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Status:
                                    </span>
                                    <span
                                        className={`rounded-md px-3 py-1 text-sm font-medium ${
                                            category.status
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}
                                    >
                                        {category.status
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Category Image
                                    </h3>
                                    {category.image ? (
                                        <img
                                            src={`/storage/${category.image}`}
                                            alt={category.name}
                                            className="h-auto w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                        />
                                    ) : (
                                        <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                                            <Filter className="mb-2 h-12 w-12 text-gray-400" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No image uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {/* Parent Category */}
                                <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Parent Category:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {category.parent?.name || '-'}
                                    </span>
                                </div>

                                {/* Subcategories */}
                                {category.children &&
                                    category.children.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                                Subcategories
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {category.children.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/categories/${child.id}`}
                                                            className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Products Count */}
                                {category.products && (
                                    <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                        <p className="text-green-700 dark:text-green-300">
                                            <strong>
                                                {category.products.length}
                                            </strong>{' '}
                                            products in this category
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </AppLayout>
    );
}
