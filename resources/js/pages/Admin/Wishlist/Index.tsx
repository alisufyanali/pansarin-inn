import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Heart, PlusCircle, ShoppingBag, Users } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Wishlists', href: '/admin/wishlist' },
];

interface WishlistRow {
    id: number;
    user:    { id: number; name: string; email: string } | null;
    product: { id: number; name: string } | null;
    variant: { id: number; sku: string; value: string; attributes: Record<string, string> | null } | null;
    created_at: string;
}

interface Props {
    stats: { total: number; unique_users: number; unique_products: number };
    flash?: { success?: string; error?: string };
}

export default function Index({ stats, flash }: Props) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'User',
            selector: (row: WishlistRow) => row.user?.name ?? '-',
            sortable: true,
            cell: (row: WishlistRow) =>
                row.user ? (
                    <div className="flex flex-col py-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{row.user.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row.user.email}</span>
                    </div>
                ) : <span className="text-gray-400">—</span>,
            width: '220px',
        },
        {
            name: 'Product',
            selector: (row: WishlistRow) => row.product?.name ?? '-',
            sortable: true,
            cell: (row: WishlistRow) => (
                <span className="text-gray-800 dark:text-gray-200">{row.product?.name ?? '—'}</span>
            ),
            width: '220px',
        },
        {
            name: 'Variant',
            selector: (row: WishlistRow) => row.variant?.sku ?? '-',
            sortable: false,
            cell: (row: WishlistRow) => {
                if (!row.variant) return <span className="text-xs text-gray-400">No variant</span>;
                const label = row.variant.attributes && Object.keys(row.variant.attributes).length > 0
                    ? Object.values(row.variant.attributes).join(' / ')
                    : row.variant.value || row.variant.sku;
                return (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                );
            },
            width: '160px',
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({ baseUrl: '/admin/wishlist', canEdit: false, canDelete: true }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'User', key: 'user.name' },
        { label: 'Email', key: 'user.email' },
        { label: 'Product', key: 'product.name' },
        { label: 'Variant', key: 'variant.sku' },
        { label: 'Created At', key: 'created_at' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wishlists" />
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wishlists</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage customer wishlist entries</p>
                    </div>
                    <Link href="/admin/wishlist/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02]">
                        <PlusCircle className="h-5 w-5" /> Add Wishlist Entry
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard title="Total Wishlists"   value={stats?.total ?? 0}           color="blue"   icon={Heart} />
                    <StatCard title="Unique Users"      value={stats?.unique_users ?? 0}    color="emerald" icon={Users} />
                    <StatCard title="Unique Products"   value={stats?.unique_products ?? 0} color="purple" icon={ShoppingBag} />
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <DataTableWrapper
                        fetchUrl="/admin/wishlist-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['user.name', 'user.email', 'product.name']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
