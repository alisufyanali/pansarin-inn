import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    DollarSign,
    Edit2,
    Image as ImageIcon,
    Info,
    Package,
    Share2,
    Tag,
} from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import PageHeader from '@/components/PageHeader';

interface Product {
    id: number;
    name: string;
    urdu_name?: string;
    scientific_name?: string;
    alternative_name?: string;
    other_name?: string;
    sku: string;
    barcode?: string;
    slug?: string;
    unit?: string;
    short_description?: string;
    long_description?: string;
    price: number;
    sale_price: number | null;
    stock_qty?: number;
    stock_alert?: number;
    thumbnail?: string;
    social_image?: string;
    gallery?: string[];
    status: boolean;
    featured: boolean;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    tags?: string | string[];
    schema_markup?: string;
    social_description?: string;
    created_at: string;
    updated_at: string;
}

export default function Show({ product }: { product: Product }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        { title: product.name, href: '#' },
    ];

    const formatPrice = (price: number | null) => {
        return price
            ? `Rs. ${parseFloat(price as any).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const actions = (
        <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
            <Edit2 className="h-4 w-4" />
            Edit Product
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="p-3">
                <PageHeader
                    title={product.name}
                    backUrl="/admin/products"
                    actions={actions}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content - 2 columns */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Information */}
                        <SectionCard
                            title="Basic Information"
                            icon={Info}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoRow
                                    label="Product Name"
                                    value={product.name}
                                />
                                <InfoRow
                                    label="SKU"
                                    value={product.sku}
                                    badge
                                />
                                <InfoRow
                                    label="Urdu Name"
                                    value={product.urdu_name}
                                />
                                <InfoRow
                                    label="Scientific Name"
                                    value={product.scientific_name}
                                />
                                <InfoRow
                                    label="Alternative Name"
                                    value={product.alternative_name}
                                />
                                <InfoRow
                                    label="Other Name"
                                    value={product.other_name}
                                />
                                <InfoRow label="Unit" value={product.unit} />
                                <InfoRow
                                    label="Barcode"
                                    value={product.barcode}
                                    badge
                                />
                                <InfoRow
                                    label="Slug"
                                    value={product.slug}
                                    badge
                                />
                            </div>

                            {/* Descriptions */}
                            {product.short_description && (
                                <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                    <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                                        Short Description
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {product.short_description}
                                    </p>
                                </div>
                            )}

                            {product.long_description && (
                                <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        Long Description
                                    </h3>
                                    <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                        {product.long_description}
                                    </p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Pricing & Stock */}
                        <SectionCard
                            title="Pricing & Stock"
                            icon={DollarSign}
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                                    <p className="mb-1 text-sm text-blue-700 dark:text-blue-300">
                                        Regular Price
                                    </p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>

                                {product.sale_price && (
                                    <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                                        <p className="mb-1 text-sm text-green-700 dark:text-green-300">
                                            Sale Price
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {formatPrice(product.sale_price)}
                                        </p>
                                        {product.price &&
                                            product.sale_price && (
                                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                    Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                                                </p>
                                            )}
                                    </div>
                                )}

                                <InfoRow
                                    label="Stock Quantity"
                                    value={product.stock_qty?.toString()}
                                />
                                <InfoRow
                                    label="Stock Alert"
                                    value={product.stock_alert?.toString()}
                                />
                            </div>
                        </SectionCard>

                        {/* Gallery Images */}
                        {product.gallery && product.gallery.length > 0 && (
                            <SectionCard
                                title={`Product Gallery (${product.gallery.length} images)`}
                                icon={ImageIcon}
                            >
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {product.gallery.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative"
                                        >
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`Gallery ${index + 1}`}
                                                className="h-48 w-full rounded-lg border border-gray-200 object-cover transition-transform duration-200 group-hover:scale-105 dark:border-gray-700"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="60" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* SEO Information */}
                        {(product.meta_title ||
                            product.meta_description ||
                            product.meta_keywords) && (
                            <SectionCard
                                title="SEO Information"
                                icon={Tag}
                            >
                                <div className="space-y-4">
                                    <InfoRow
                                        label="Meta Title"
                                        value={product.meta_title}
                                    />
                                    <InfoRow
                                        label="Meta Description"
                                        value={product.meta_description}
                                        multiline
                                    />
                                    <InfoRow
                                        label="Meta Keywords"
                                        value={product.meta_keywords}
                                    />
                                    {product.tags && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Tags
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(product.tags)
                                                    ? product.tags
                                                    : product.tags.split(',')
                                                ).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                    >
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Thumbnail Image */}
                        <SectionCard
                            title="Thumbnail Image"
                            icon={Package}
                        >
                            {product.thumbnail ? (
                                <img
                                    src={`/storage/${product.thumbnail}`}
                                    alt={product.name}
                                    className="h-auto w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext x="150" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="80" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            ) : (
                                <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                                    <Package className="mb-2 h-16 w-16 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No thumbnail
                                    </p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Social Media Image */}
                        {product.social_image && (
                            <SectionCard
                                title="Social Media Image"
                                icon={Share2}
                            >
                                <img
                                    src={`/storage/${product.social_image}`}
                                    alt="Social preview"
                                    className="h-auto w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext x="150" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="80" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                                {product.social_description && (
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        {product.social_description}
                                    </p>
                                )}
                            </SectionCard>
                        )}

                        {/* Status Cards */}
                        <SectionCard
                            title="Status"
                            icon={Info}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Active Status
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            product.status
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {product.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Featured
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            product.featured
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {product.featured ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Timestamps */}
                        <SectionCard
                            title="Timestamps"
                            icon={Info}
                        >
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Created
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(product.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(product.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Helper Component
function InfoRow({
    label,
    value,
    badge = false,
    multiline = false,
}: {
    label: string;
    value?: string | null;
    badge?: boolean;
    multiline?: boolean;
}) {
    if (!value) return null;

    return (
        <div
            className={
                multiline ? '' : 'flex items-start justify-between gap-4'
            }
        >
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {label}
            </span>
            {badge ? (
                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {value}
                </code>
            ) : (
                <span
                    className={`text-sm text-gray-900 dark:text-white ${multiline ? 'mt-2 block' : 'text-right'}`}
                >
                    {value}
                </span>
            )}
        </div>
    );
}
