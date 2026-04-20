import InfoRow from '@/components/InfoRow';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Package, ShoppingBag, User } from 'lucide-react';

interface WishlistDetail {
    id: number;
    user_id: number;
    product_id: number;
    product_variant_id: number | null;
    user:    { id: number; name: string; email: string } | null;
    product: { id: number; name: string; thumbnail: string | null } | null;
    variant: { id: number; sku: string; value: string | null; attributes: Record<string, string> | null } | null;
    created_at: string;
    updated_at: string;
}

export default function Show({ wishlist }: { wishlist: WishlistDetail }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Wishlists', href: '/admin/wishlist' },
        { title: `Wishlist #${wishlist.id}`, href: '#' },
    ];

    const variantLabel = wishlist.variant
        ? (wishlist.variant.attributes && Object.keys(wishlist.variant.attributes).length > 0
            ? Object.values(wishlist.variant.attributes).join(' / ')
            : wishlist.variant.value || wishlist.variant.sku)
        : null;

    const fmt = (d: string) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Wishlist #${wishlist.id}`} />
            <div className="p-3">
                <PageHeader title={`Wishlist #${wishlist.id}`} backUrl="/admin/wishlist" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <SectionCard title="User Information" icon={User}>
                            <div className="space-y-4">
                                <InfoRow label="User ID" value={String(wishlist.user_id)} />
                                <InfoRow label="Name"    value={wishlist.user?.name} />
                                <InfoRow label="Email"   value={wishlist.user?.email} />
                            </div>
                        </SectionCard>

                        <SectionCard title="Product Information" icon={ShoppingBag} iconColor="text-emerald-600">
                            <div className="space-y-4">
                                <InfoRow label="Product ID"   value={String(wishlist.product_id)} />
                                <InfoRow label="Product Name" value={wishlist.product?.name} />
                                {wishlist.product?.thumbnail && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Thumbnail</p>
                                        <img src={`/storage/${wishlist.product.thumbnail}`} alt={wishlist.product.name}
                                            className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {wishlist.variant && (
                            <SectionCard title="Variant Information" icon={Package} iconColor="text-purple-600">
                                <div className="space-y-4">
                                    <InfoRow label="Variant ID" value={String(wishlist.product_variant_id)} />
                                    <InfoRow label="SKU"        value={wishlist.variant.sku} mono />
                                    {variantLabel && <InfoRow label="Variant" value={variantLabel} />}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Timestamps</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created At</p>
                                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{fmt(wishlist.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Updated At</p>
                                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{fmt(wishlist.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Entry ID</dt>
                                    <dd className="font-semibold">#{wishlist.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Has Variant</dt>
                                    <dd>
                                        {wishlist.variant
                                            ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Yes</span>
                                            : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">No</span>
                                        }
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
