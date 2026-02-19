import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Copy,
    Edit,
    Eye,
    Flame,
    Package,
    Percent,
    Plus,
    Power,
    Tag,
    Trash2,
    Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Deals', href: '/admin/deals' },
];

interface Deal {
    id: number;
    title: string;
    deal_type: string;
    discount_value: number;
    products_count: number;
    starts_at: string;
    ends_at: string;
    current_uses: number;
    max_uses: number;
    is_featured: boolean;
    is_active: boolean;
    badge_text: string;
    badge_color: string;
    created_at: string;
}

interface Props {
    stats: {
        total: number;
        active: number;
        featured: number;
        expired: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ stats, flash }: Props) {
    const canEdit = true;
    const canDelete = true;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleToggleStatus = (id: number) => {
        router.post(
            `/admin/deals/${id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Deal status updated!'),
            },
        );
    };

    const handleDuplicate = (id: number) => {
        router.post(
            `/admin/deals/${id}/duplicate`,
            {},
            {
                onSuccess: () => toast.success('Deal duplicated!'),
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this deal?')) {
            router.delete(`/admin/deals/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Deal deleted!'),
            });
        }
    };

    const getDealTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            percentage: 'Percentage',
            fixed: 'Fixed Amount',
            buy_x_get_y: 'Buy X Get Y',
            bundle: 'Bundle',
            flash_sale: 'Flash Sale',
        };
        return types[type] || type;
    };

    const getDealTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            percentage:
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            fixed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            buy_x_get_y:
                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            bundle: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            flash_sale:
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const columns = [
        CommonColumns.id(),
        {
            name: 'Deal',
            selector: (row: Deal) => row.title,
            cell: (row: Deal) => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {row.title}
                        </span>
                        {row.is_featured && (
                            <span className="flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <Zap size={12} />
                            </span>
                        )}
                    </div>
                    <span
                        className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getDealTypeColor(row.deal_type)}`}
                    >
                        {getDealTypeLabel(row.deal_type)}
                    </span>
                </div>
            ),
            sortable: true,
            width: '220px',
        },
        {
            name: 'Discount',
            selector: (row: Deal) => row.discount_value,
            cell: (row: Deal) => (
                <div className="flex items-center gap-1.5">
                    <Percent
                        size={14}
                        className="text-green-600 dark:text-green-400"
                    />
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        {row.deal_type === 'percentage'
                            ? `${row.discount_value}%`
                            : row.deal_type === 'fixed'
                              ? `Rs. ${row.discount_value}`
                              : '-'}
                    </span>
                </div>
            ),
            sortable: true,
            width: '110px',
        },
        {
            name: 'Products',
            selector: (row: Deal) => row.products_count,
            cell: (row: Deal) => (
                <div className="flex items-center gap-1.5">
                    <Package
                        size={14}
                        className="text-blue-600 dark:text-blue-400"
                    />
                    <span className="font-medium">{row.products_count}</span>
                </div>
            ),
            sortable: true,
            width: '90px',
        },
        {
            name: 'Duration',
            selector: (row: Deal) => row.starts_at,
            cell: (row: Deal) => (
                <div className="text-xs">
                    {row.starts_at && (
                        <div className="text-gray-600 dark:text-gray-400">
                            {new Date(row.starts_at).toLocaleDateString()}
                        </div>
                    )}
                    {row.ends_at && (
                        <div className="text-gray-500 dark:text-gray-500">
                            to {new Date(row.ends_at).toLocaleDateString()}
                        </div>
                    )}
                    {!row.starts_at && !row.ends_at && (
                        <span className="text-gray-400">No limit</span>
                    )}
                </div>
            ),
            width: '130px',
        },
        {
            name: 'Status',
            selector: (row: Deal) => row.is_active,
            cell: (row: Deal) => {
                const now = new Date();
                const isExpired = row.ends_at && new Date(row.ends_at) < now;
                const isUpcoming =
                    row.starts_at && new Date(row.starts_at) > now;

                return (
                    <button
                        onClick={() => handleToggleStatus(row.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            isExpired
                                ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
                                : row.is_active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        {isExpired
                            ? 'Expired'
                            : isUpcoming
                              ? 'Upcoming'
                              : row.is_active
                                ? 'Active'
                                : 'Inactive'}
                    </button>
                );
            },
            sortable: true,
            width: '100px',
        },
        CommonColumns.createdAt(true),
        {
            name: 'Actions',
            cell: (row: Deal) => (
                <div className="flex items-center gap-1">
                    <Link
                        href={`/admin/deals/${row.id}`}
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="View"
                    >
                        <Eye size={16} />
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/admin/deals/${row.id}/edit`}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </Link>
                    )}
                    <button
                        onClick={() => handleDuplicate(row.id)}
                        className="rounded-lg p-2 text-purple-600 transition hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
            width: '140px',
            right: true,
        },
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Type', key: 'deal_type' },
        { label: 'Discount', key: 'discount_value' },
        { label: 'Products', key: 'products_count' },
        { label: 'Start Date', key: 'starts_at' },
        { label: 'End Date', key: 'ends_at' },
        { label: 'Uses', key: 'current_uses' },
        { label: 'Status', key: 'is_active' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Deals" />
            
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Product Deals
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage product discounts and special offers
                        </p>
                    </div>
                    <Link
                        href="/admin/deals/create"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Deal</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Deals"
                        value={stats?.total || 0}
                        color="blue"
                        icon={Tag}
                    />
                    <StatCard
                        title="Active Deals"
                        value={stats?.active || 0}
                        color="emerald"
                        icon={Power}
                    />
                    <StatCard
                        title="Featured"
                        value={stats?.featured || 0}
                        color="amber"
                        icon={Flame}
                    />
                    <StatCard
                        title="Expired"
                        value={stats?.expired || 0}
                        color="red"
                        icon={Calendar}
                    />
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/deals-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['title', 'description']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}