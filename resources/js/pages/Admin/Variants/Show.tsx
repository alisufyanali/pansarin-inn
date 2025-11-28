import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { can } from '@/lib/can';

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

export default function Show({ variant }: { variant: Variant }) {
    const canEdit = can('edit.variants');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Variants', href: '/product-variants' },
        { title: variant.sku, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={variant.sku} />
            <div className="p-3">
                <div className="flex items-center gap-2 mb-4">
                    <Link
                        href="/product-variants"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/product-variants/${variant.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
                            title="Edit"
                        >
                            <Edit2 />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Variant Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{variant.sku}</h1>
                        
                        <div className="space-y-4 mt-4">
                            {/* Product */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Product:</span>
                                <Link
                                    href={`/Products/${variant.product?.id}`}
                                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {variant.product?.name || '-'}
                                </Link>
                            </div>

                            {/* Price */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs. {parseFloat(variant.price as any).toFixed(2)}</span>
                            </div>

                            {/* Stock */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Stock Quantity:</span>
                                <span className={`px-3 py-1 rounded-md text-sm font-bold ${
                                    variant.stock > 0
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}>
                                    {variant.stock} units
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    variant.status 
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}>
                                    {variant.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Default Variant */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Default Variant:</span>
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    variant.is_default 
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}>
                                    {variant.is_default ? 'Yes' : 'No'}
                                </span>
                            </div>

                            {/* Attributes */}
                            {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Attributes</h3>
                                    <div className="space-y-2">
                                        {Object.entries(variant.attributes).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded">
                                                <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
