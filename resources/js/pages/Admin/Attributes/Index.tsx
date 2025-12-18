import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attributes', href: '/admin/attributes' },
];

type Attribute = {
    id: number;
    name: string;
    slug: string;
    values: Array<{ id: number; value: string; slug: string }>;
};

export default function Index({ attributes }: { attributes: Attribute[] }) {
    const canCreate = can('create.attributes');
    const canEdit = can('edit.attributes');
    const canDelete = can('delete.attributes');

    function handleDelete(id: number): void {
        if (!canDelete) return;
        if (confirm('Are you sure you want to delete this attribute? This action cannot be undone.')) {
            router.delete(`/admin/attributes/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attributes" />
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attributes</h2>
                    {canCreate && (
                        <Link
                            href="/admin/attributes/create"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <PlusCircle size={18} />
                            <span className="hidden sm:inline">Create Attribute</span>
                        </Link>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    {attributes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <PlusCircle className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">Koi attribute nahi hain</p>
                            {canCreate && (
                                <Link
                                    href="/admin/attributes/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <PlusCircle size={18} />
                                    Pehla Attribute Banao
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-700 dark:text-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Slug</th>
                                        <th className="py-3 px-4">Values</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {attributes.map(attr => (
                                        <tr key={attr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{attr.id}</td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">{attr.name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                                                    {attr.slug}
                                                </code>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {attr.values?.slice(0, 3).map((val) => (
                                                        <span
                                                            key={val.id}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                        >
                                                            {val.value}
                                                        </span>
                                                    ))}
                                                    {attr.values?.length > 3 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                                                            +{attr.values.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canEdit ? (
                                                        <Link
                                                            href={`/admin/attributes/${attr.id}/edit`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            aria-disabled
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed"
                                                            title="Edit (disabled)"
                                                        >
                                                            <Edit2 size={14} />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(attr.id)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition ${
                                                            canDelete
                                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                : 'bg-red-600/40 text-white/60 opacity-50 cursor-not-allowed'
                                                        }`}
                                                        title={canDelete ? 'Delete' : 'Delete (disabled)'}
                                                        disabled={!canDelete}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
