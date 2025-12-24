import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { can } from '@/lib/can';

type Category = { id: number; name: string };
type Vendor = { id: number; shop_name: string };

interface Product {
    id: number;
    name: string;
    sku: string;
    description: string;
    price: number;
    sale_price: number | null;
    thumbnail: string | null;
    status: boolean;
    featured: boolean;
    category?: Category;
    vendor?: Vendor;
    variants?: any[];
}

export default function Show({ product }: { product: Product }) {
    const canEdit = can('edit.products');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/Products' },
        { title: product.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="p-3">
                <div className="flex items-center gap-2 mb-4">
                    <Link
                        href="/Products"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/Products/${product.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
                            title="Edit"
                        >
                            <Edit2 />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Product Details */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                            
                            <div className="space-y-4 mt-4">
                                {/* SKU */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{product.sku || '-'}</span>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                        product.status 
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                        {product.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Featured */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Featured:</span>
                                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                        product.featured 
                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                    }`}>
                                        {product.featured ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                {/* Category */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{product.category?.name || '-'}</span>
                                </div>

                                {/* Vendor */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400">Vendor:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{product.vendor?.shop_name || '-'}</span>
                                </div>

                                {/* Pricing */}
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Regular Price:</span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs. {parseFloat(product.price as any).toFixed(2)}</span>
                                    </div>
                                    {product.sale_price && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Sale Price:</span>
                                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">Rs. {parseFloat(product.sale_price as any).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{product.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    {product.thumbnail && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Image</h3>
                            <img 
                                src={product.thumbnail} 
                                alt={product.name}
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