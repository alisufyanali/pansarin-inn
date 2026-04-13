import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, MapPin, Map } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cities', href: '/admin/cities' },
];

interface City {
    id: number;
    name: string;
    shipping_charges: number;
    province: string;
    created_at: string;
}

interface Stats {
    total: number;
    sindh: number;
    punjab: number;
    balochistan: number;
    kpk: number;
    gilgit: number;
    azad_kashmir: number;
}

interface Props {
    stats: Stats;
    flash?: { success?: string; error?: string };
}

const provinceLabel: Record<string, string> = {
    sindh: 'Sindh',
    punjab: 'Punjab',
    balochistan: 'Balochistan',
    kpk: 'KPK',
    gilgit: 'Gilgit-Baltistan',
    azad_kashmir: 'Azad Kashmir',
};

const provinceColor: Record<string, string> = {
    sindh: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    punjab: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    balochistan: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    kpk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    gilgit: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    azad_kashmir: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function Index({ stats, flash }: Props) {
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    const columns = [
        CommonColumns.id(),
        {
            name: 'City Name',
            selector: (row: City) => row.name,
            sortable: true,
            cell: (row: City) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</span>
                </div>
            ),
            grow: 2,
        },
        {
            name: 'Province',
            selector: (row: City) => row.province,
            sortable: true,
            cell: (row: City) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${provinceColor[row.province] ?? ''}`}>
                    {provinceLabel[row.province] ?? row.province}
                </span>
            ),
        },
        {
            name: 'Shipping Charges',
            selector: (row: City) => row.shipping_charges,
            sortable: true,
            cell: (row: City) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    PKR {Number(row.shipping_charges).toLocaleString()}
                </span>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({ baseUrl: '/admin/cities', canEdit, canDelete }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Name', key: 'name' },
        { label: 'Province', key: 'province' },
        { label: 'Shipping Charges', key: 'shipping_charges' },
        { label: 'Created At', key: 'created_at' },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cities" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cities</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage cities and their shipping charges
                        </p>
                    </div>
                    {canCreate && (
                        <Link
                            href="/admin/cities/create"
                            className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Add New City</span>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard title="Total" value={stats.total} color="blue" icon={Map} />
                    <StatCard title="Sindh" value={stats.sindh} color="blue" icon={MapPin} />
                    <StatCard title="Punjab" value={stats.punjab} color="emerald" icon={MapPin} />
                    <StatCard title="Balochistan" value={stats.balochistan} color="amber" icon={MapPin} />
                    <StatCard title="KPK" value={stats.kpk} color="purple" icon={MapPin} />
                    <StatCard title="Gilgit / AJK" value={stats.gilgit + stats.azad_kashmir} color="red" icon={MapPin} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/cities-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['name', 'province']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
