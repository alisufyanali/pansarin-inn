import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, CheckCircle, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Health Concerns', href: '/admin/health-concerns' },
];

interface HealthConcern {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    icon_url?: string;
    status: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    stats?: { total: number; active: number };
    flash?: { success?: string; error?: string };
}

export default function Index({ stats, flash }: Props) {
    const hcStats = stats || { total: 0, active: 0 };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Icon',
            selector: (row: HealthConcern) => row.icon_url || '',
            sortable: false,
            width: '80px',
            cell: (row: HealthConcern) =>
                row.icon_url ? (
                    <img
                        src={row.icon_url}
                        alt={row.name}
                        className="w-10 h-10 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                ),
        },
        {
            name: 'Name',
            selector: (row: HealthConcern) => row.name,
            sortable: true,
            cell: (row: HealthConcern) => (
                <span className="font-semibold text-gray-900 dark:text-white">{row.name}</span>
            ),
        },
        {
            name: 'Slug',
            selector: (row: HealthConcern) => row.slug || '-',
            sortable: true,
            cell: (row: HealthConcern) =>
                row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>,
        },
        {
            name: 'Sort',
            selector: (row: HealthConcern) => row.sort_order,
            sortable: true,
            width: '80px',
            cell: (row: HealthConcern) => (
                <span className="text-gray-600 dark:text-gray-400">{row.sort_order}</span>
            ),
        },
        {
            name: 'Status',
            selector: (row: HealthConcern) => (row.status ? 'Active' : 'Inactive'),
            sortable: true,
            width: '110px',
            center: true,
            cell: (row: HealthConcern) => (
                <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                        row.status
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl: '/admin/health-concerns',
            showView: false,
            canEdit: true,
            canDelete: true,
        }),
    ];

    const csvHeaders = [
        { label: 'ID',         key: 'id' },
        { label: 'Name',       key: 'name' },
        { label: 'Slug',       key: 'slug' },
        { label: 'Status',     key: 'status' },
        { label: 'Sort Order', key: 'sort_order' },
        { label: 'Created At', key: 'created_at' },
    ];

    const additionalFilters = [
        {
            name: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'active',   label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
            ],
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Health Concerns" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Concerns</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage health concerns and tag products with multiple concerns
                        </p>
                    </div>
                    <Link
                        href="/admin/health-concerns/create"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Health Concern</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard title="Total"  value={hcStats.total}  color="blue"    icon={Activity}      />
                    <StatCard title="Active" value={hcStats.active} color="emerald" icon={CheckCircle}   />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/health-concerns-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['name', 'slug']}
                        additionalFilters={additionalFilters}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
