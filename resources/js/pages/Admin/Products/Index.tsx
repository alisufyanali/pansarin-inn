import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle,  ToggleRight, ToggleLeft } from 'lucide-react';

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
    featured: boolean;
    thumbnail?: string;
    stock_qty?: number;
    category?: { id: number; name: string };
    subCategory?: { id: number; name: string };
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

    function togglePublish(product: Product): void {
        if (!canEdit) return;
        router.patch(`/admin/products/${product.id}`, {
            status: !product.status,
        }, {
            preserveScroll: true,
        });
    }

    function toggleFeatured(product: Product): void {
        if (!canEdit) return;
        router.patch(`/admin/products/${product.id}`, {
            featured: !product.featured,
        }, {
            preserveScroll: true,
        });
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
                            <PlusCircle size={18} />
                            <span className="hidden sm:inline">Create Product</span>
                        </Link>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-left text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                <th className="py-3 px-3 w-16">Image</th>
                                <th className="py-3 px-3 min-w-48">Title</th>
                                <th className="py-3 px-3">Quantity</th>
                                <th className="py-3 px-3 min-w-32">Category</th>
                                <th className="py-3 px-3 min-w-32">Sub Category</th>
                                <th className="py-3 px-3 text-center">Today's Deal</th>
                                <th className="py-3 px-3 text-center">Publish</th>
                                <th className="py-3 px-3 text-center">Featured</th>
                                <th className="py-3 px-3">Options</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
                                        "There are no products."
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        {/* Image */}
                                        <td className="py-3 px-3">
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                                                {product.thumbnail ? (
                                                    <img 
                                                        src={product.thumbnail} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-2xl">📦</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Title */}
                                        <td className="py-3 px-3">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {product.sku}
                                            </div>
                                        </td>

                                        {/* Current Quantity */}
                                        <td className="py-3 px-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-12 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium">
                                                {product.stock_qty || 0}
                                            </span>
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                                {product.category?.name || '-'}
                                            </span>
                                        </td>

                                        {/* Sub Category */}
                                        <td className="py-3 px-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                                                {product.subCategory?.name || '-'}
                                            </span>
                                        </td>

                                        {/* Today's Deal - Toggle */}
                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => {}}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                title="Today's Deal"
                                            >
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox"
                                                        defaultChecked={false}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-8 h-5 bg-red-400 peer-checked:bg-red-600 rounded-full transition-colors"></div>
                                                    <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-3"></div>
                                                </div>
                                            </button>
                                        </td>

                                        {/* Publish - Toggle */}
                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => togglePublish(product)}
                                                disabled={!canEdit}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition ${
                                                    canEdit 
                                                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                                        : 'opacity-50 cursor-not-allowed'
                                                }`}
                                                title="Publish"
                                            >
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox"
                                                        checked={product.status}
                                                        readOnly
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-8 h-5 rounded-full transition-colors ${
                                                        product.status
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-400'
                                                    }`}></div>
                                                    <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                                        product.status
                                                            ? 'left-3.5'
                                                            : 'left-0.5'
                                                    }`}></div>
                                                </div>
                                            </button>
                                        </td>

                                        {/* Featured - Toggle */}
                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => toggleFeatured(product)}
                                                disabled={!canEdit}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition ${
                                                    canEdit 
                                                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                                        : 'opacity-50 cursor-not-allowed'
                                                }`}
                                                title="Featured"
                                            >
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox"
                                                        checked={product.featured}
                                                        readOnly
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-8 h-5 rounded-full transition-colors ${
                                                        product.featured
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-400'
                                                    }`}></div>
                                                    <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                                        product.featured
                                                            ? 'left-3.5'
                                                            : 'left-0.5'
                                                    }`}></div>
                                                </div>
                                            </button>
                                        </td>

                                        {/* Options - Action Buttons */}
                                        <td className="py-3 px-3">
                                            <div className="flex flex-wrap gap-1">
                                                {/* View */}
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
                                                    title="View"
                                                >
                                                    <Eye size={14} />
                                                    <span className="hidden sm:inline">View</span>
                                                </Link>

                                                {/* Discount Button */}
                                                <button
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition"
                                                    title="Discount"
                                                    onClick={() => {}}
                                                >
                                                    <span>%</span>
                                                    <span className="hidden sm:inline">Discount</span>
                                                </button>

                                                {/* Stock Button */}
                                                <button
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition"
                                                    title="Stock"
                                                    onClick={() => {}}
                                                >
                                                    <span>📦</span>
                                                    <span className="hidden sm:inline">Stock</span>
                                                </button>

                                                {/* Destroy Button */}
                                                <button
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-700 hover:bg-gray-800 text-white transition"
                                                    title="Destroy"
                                                    onClick={() => {}}
                                                >
                                                    <span>🗑️</span>
                                                    <span className="hidden sm:inline">Destroy</span>
                                                </button>

                                                {/* Edit */}
                                                {canEdit ? (
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </Link>
                                                ) : (
                                                    <span
                                                        aria-disabled
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed"
                                                        title="Edit (disabled)"
                                                    >
                                                        <Edit2 size={14} />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </span>
                                                )}

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={!canDelete}
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
                                                        canDelete 
                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                            : 'bg-red-600/40 text-white/60 opacity-50 cursor-not-allowed'
                                                    }`}
                                                    title={canDelete ? 'Delete' : 'Delete (disabled)'}
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
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
