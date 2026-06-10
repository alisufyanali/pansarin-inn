import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Monitor, Smartphone, LayoutDashboard, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Slides', href: '/admin/slides' }];

interface Slide {
    id: number;
    type: 'desktop' | 'mobile';
    title: string | null;
    subtitle: string | null;
    btn_text: string | null;
    btn_url: string | null;
    image: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Stats { total: number; desktop: number; mobile: number; active: number; }

export default function Index({ stats, flash }: { stats: Stats; flash?: { success?: string; error?: string } }) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Type',
            selector: (row: Slide) => row.type,
            sortable: true,
            cell: (row: Slide) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    row.type === 'desktop'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                    {row.type === 'desktop' ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                    {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                </span>
            ),
            width: '120px',
        },
        {
            name: 'Image',
            cell: (row: Slide) => row.image
                ? <img src={`/storage/${row.image}`} alt={row.title ?? ''} className="h-12 w-20 object-cover rounded-lg border" />
                : <div className="h-12 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-xs">No image</div>,
            width: '100px',
        },
        {
            name: 'Title / Subtitle',
            selector: (row: Slide) => row.title || '',
            sortable: true,
            cell: (row: Slide) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{row.title || '—'}</span>
                    {row.subtitle && <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{row.subtitle}</span>}
                </div>
            ),
            grow: 2,
        },
        {
            name: 'Button',
            cell: (row: Slide) => row.btn_text
                ? <div className="flex flex-col text-xs"><span className="font-medium">{row.btn_text}</span><span className="text-gray-400 truncate max-w-[120px]">{row.btn_url}</span></div>
                : <span className="text-gray-400 text-xs">—</span>,
        },
        {
            name: 'Order',
            selector: (row: Slide) => row.sort_order,
            sortable: true,
            cell: (row: Slide) => <span className="font-mono text-sm">{row.sort_order}</span>,
            width: '80px',
        },
        {
            name: 'Status',
            selector: (row: Slide) => row.is_active,
            sortable: true,
            cell: (row: Slide) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '100px',
        },
        CommonColumns.actions({ baseUrl: '/admin/slides', canEdit: true, canDelete: true }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Type', key: 'type' },
        { label: 'Title', key: 'title' },
        { label: 'Subtitle', key: 'subtitle' },
        { label: 'Button Text', key: 'btn_text' },
        { label: 'Button URL', key: 'btn_url' },
        { label: 'Sort Order', key: 'sort_order' },
        { label: 'Active', key: 'is_active' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Slides" />
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Slides</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage homepage slider banners</p>
                    </div>
                    <Link
                        href="/admin/slides/create"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Slide
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard title="Total"   value={stats.total}   color="blue"    icon={LayoutDashboard} />
                    <StatCard title="Desktop" value={stats.desktop} color="indigo"  icon={Monitor} />
                    <StatCard title="Mobile"  value={stats.mobile}  color="purple"  icon={Smartphone} />
                    <StatCard title="Active"  value={stats.active}  color="emerald" icon={CheckCircle} />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/slides-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['title', 'subtitle', 'type']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
