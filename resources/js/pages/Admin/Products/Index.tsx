import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/products' },
];

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    sale_price: number | null;
    status: boolean;
    category?: { id: number; name: string };
}

export default function Index({ products }: { products: Product[] }) {
    // Permission checks
    const canCreate = can('create.products');
    const canEdit = can('edit.products');
    const canDelete = can('delete.products');

    function handleDelete(id: number): void {
        if (!canDelete) return;
        if (confirm('Kya aap sure hain ke is product ko delete karna hai?')) {
            router.delete(`/admin/products/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
                    {canCreate && (
                        <Link
                            href="/admin/products/create"
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
                                <th className="py-3 px-4">Product Name</th>
                                <th className="py-3 px-4">SKU</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4">Sale Price</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                                        Koi product nahi hain
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <td className="py-3 px-4">{product.id}</td>
                                        <td className="py-3 px-4 font-medium">{product.name}</td>
                                        <td className="py-3 px-4">{product.sku || '-'}</td>
                                        <td className="py-3 px-4">Rs. {parseFloat(product.price as any).toFixed(2)}</td>
                                        <td className="py-3 px-4">
                                            {product.sale_price ? `Rs. ${parseFloat(product.sale_price as any).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                product.status 
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            }`}>
                                                {product.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-9 h-9"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            {canEdit ? (
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
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
                                                onClick={() => handleDelete(product.id)}
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
