import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Variants', href: '/admin/product-variants' },
];

interface Variant {
    id: number;
    sku: string;
    price: number;
    stock: number;
    status: boolean;
    is_default: boolean;
    attributes?: Record<string, string>;
    product?: { id: number; name: string };
}

export default function Index({ variants }: { variants: Variant[] }) {
    // Permission checks
    const canCreate = can('create.variants');
    const canEdit = can('edit.variants');
    const canDelete = can('delete.variants');

    function handleDelete(id: number): void {
        if (!canDelete) return;
        if (confirm('Kya aap sure hain ke is variant ko delete karna hai?')) {
            router.delete(`/admin/product-variants/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Variants" />
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Variants</h2>
                    {canCreate && (
                        <Link
                            href="/admin/product-variants/create"
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
                                <th className="py-3 px-4">Product</th>
                                <th className="py-3 px-4">SKU</th>
                                <th className="py-3 px-4">Size/Variant</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4">Stock</th>
                                <th className="py-3 px-4">Default</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {variants.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                                        Koi variant nahi hain
                                    </td>
                                </tr>
                            ) : (
                                variants.map(variant => (
                                    <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <td className="py-3 px-4">{variant.id}</td>
                                        <td className="py-3 px-4 font-medium">{variant.product?.name || '-'}</td>
                                        <td className="py-3 px-4">{variant.sku}</td>
                                        <td className="py-3 px-4">Rs. {parseFloat(variant.price as any).toFixed(2)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                variant.stock > 0
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            }`}>
                                                {variant.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {variant.is_default ? (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    Default
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                variant.status 
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            }`}>
                                                {variant.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <Link
                                                href={`/admin/product-variants/${variant.id}`}
                                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-9 h-9"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            {canEdit ? (
                                                <Link
                                                    href={`/admin/product-variants/${variant.id}/edit`}
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
                                                onClick={() => handleDelete(variant.id)}
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
