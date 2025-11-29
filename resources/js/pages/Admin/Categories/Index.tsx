import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/admin/categories' },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    status: boolean;
    parent?: { id: number; name: string } | null;
}

export default function Index({ categories }: { categories: Category[] }) {
    // Permission checks
    const canCreate = can('create.categories');
    const canEdit = can('edit.categories');
    // const canDelete = can('delete.categories');
    const canDelete = true;

    function handleDelete(id: number): void {
        if (!canDelete) return;
        if (confirm('Kya aap sure hain ke is category ko delete karna hai?')) {
            router.delete(`/admin/categories/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
                    {canCreate && (
                        <Link
                            href="/admin/categories/create"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <PlusCircle />
                            <span className="hidden sm:inline">Create</span>
                        </Link>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg overflow-x-auto">
                    <table className="w-full text-left text-gray-700 dark:text-gray-300 text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Category Name</th>
                                <th className="py-3 px-4">Slug</th>
                                <th className="py-3 px-4">Parent</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                                        Koi category nahi hain
                                    </td>
                                </tr>
                            ) : (
                                categories.map(category => (
                                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <td className="py-3 px-4">{category.id}</td>
                                        <td className="py-3 px-4 font-medium">{category.name}</td>
                                        <td className="py-3 px-4">{category.slug}</td>
                                        <td className="py-3 px-4">{category.parent?.name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                category.status 
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            }`}>
                                                {category.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <Link
                                                href={`/admin/categories/${category.id}`}
                                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-9 h-9"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            {canEdit ? (
                                                <Link
                                                    href={`/admin/categories/${category.id}/edit`}
                                                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-9 h-9"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                            ) : (
                                                <span
                                                    aria-disabled
                                                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-60 w-9 h-9"
                                                    title="Edit (disabled)"
                                                >
                                                    <Edit2 size={16} />
                                                </span>
                                            )}

                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className={`inline-flex items-center justify-center rounded-md w-9 h-9 ${
                                                    canDelete 
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-red-600/40 text-white/60 opacity-60 cursor-not-allowed'
                                                }`}
                                                title={canDelete ? 'Delete' : 'Delete (disabled)'}
                                                disabled={!canDelete}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
