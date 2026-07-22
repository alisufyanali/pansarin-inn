import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Coins, Users, TrendingUp, Settings, ArrowUpCircle } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Loyalty Points', href: '/admin/loyalty' },
];

interface CustomerRow {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    balance: number;
    created_at: string;
}

interface Stats {
    total_balance: number;
    customers_with_points: number;
    total_earned: number;
    total_adjusted: number;
}

export default function Index({
    stats,
    flash,
}: {
    stats: Stats;
    flash?: { success?: string; error?: string };
}) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Customer',
            selector: (row: CustomerRow) => row.first_name,
            sortable: true,
            cell: (row: CustomerRow) => (
                <div className="flex flex-col">
                    <Link
                        href={`/admin/loyalty/${row.id}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.first_name} {row.last_name}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: 'Email',
            selector: (row: CustomerRow) => row.email ?? '',
            cell: (row: CustomerRow) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">{row.email ?? '—'}</span>
            ),
            grow: 1.5,
        },
        {
            name: 'Points Balance',
            selector: (row: CustomerRow) => row.balance,
            sortable: true,
            cell: (row: CustomerRow) => (
                <span className={`text-lg font-bold ${row.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {row.balance.toLocaleString()} pts
                </span>
            ),
        },
        CommonColumns.createdAt(true),
        {
            name: 'Actions',
            cell: (row: CustomerRow) => (
                <Link
                    href={`/admin/loyalty/${row.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                    View Ledger
                </Link>
            ),
            width: '120px',
            ignoreRowClick: true,
        },
    ];

    const csvHeaders = [
        { label: 'ID',      key: 'id' },
        { label: 'Name',    key: 'first_name' },
        { label: 'Phone',   key: 'phone' },
        { label: 'Email',   key: 'email' },
        { label: 'Balance', key: 'balance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loyalty Points" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loyalty Points</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage customer points balances and earning rules
                        </p>
                    </div>
                    <Link
                        href="/admin/loyalty/settings"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-xl font-semibold transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        Earning Rules
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Points in Circulation" value={stats.total_balance.toLocaleString() + ' pts'} color="indigo"  icon={Coins} />
                    <StatCard title="Customers with Points"       value={stats.customers_with_points}                  color="blue"    icon={Users} />
                    <StatCard title="Total Earned"                value={stats.total_earned.toLocaleString() + ' pts'} color="emerald" icon={TrendingUp} />
                    <StatCard title="Admin Adjusted"              value={stats.total_adjusted.toLocaleString() + ' pts'} color="amber" icon={ArrowUpCircle} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/loyalty-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['first_name', 'last_name', 'phone', 'email']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
