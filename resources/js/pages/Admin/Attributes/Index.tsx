import DataTableWrapper from '@/components/DataTableWrapper';
import StatCard from '@/components/StatCard';
import { CommonColumns } from '@/components/TableColumns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Tag } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attributes', href: '/admin/attributes' },
];

interface AttributeValue {
    id: number;
    value: string;
    slug: string;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    values: AttributeValue[];
    created_at: string;
    updated_at: string;
}

interface Props {
    attributes?:
        | Attribute[]
        | {
              data: Attribute[];
              total: number;
          };
    flash?: {
        success?: string;
        error?: string;
    };
}

const DEFAULT_ATTRIBUTES = {
    data: [],
    total: 0,
};

export default function Index({
    attributes = DEFAULT_ATTRIBUTES,
    flash,
}: Props) {
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    // Convert array to paginated format if needed
    const formattedAttributes = Array.isArray(attributes)
        ? { data: attributes, total: attributes.length }
        : attributes || DEFAULT_ATTRIBUTES;

    // Define columns using helper
    const columns = [
        CommonColumns.id(),
        CommonColumns.name('Attribute Name'),
        CommonColumns.slug(),
        {
            name: 'Values',
            selector: (row: Attribute) => row.values?.length || 0,
            sortable: true,
            sortField: 'values_count',
            cell: (row: Attribute) => (
                <div className="flex flex-wrap gap-1">
                    {row.values?.slice(0, 3).map((val) => (
                        <span
                            key={val.id}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        >
                            {val.value}
                        </span>
                    ))}
                    {row.values?.length > 3 && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                            +{row.values.length - 3} more
                        </span>
                    )}
                </div>
            ),
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({
            baseUrl: '/admin/attributes',
            canEdit,
            canDelete,
        }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Attribute Name', key: 'name' },
        { label: 'Slug', key: 'slug' },
        { label: 'Values Count', key: 'values.length' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Updated At', key: 'updated_at' },
    ];

    // Calculate stats
    const stats = {
        total: formattedAttributes.total || 0,
        withValues:
            formattedAttributes.data?.filter((a) => a?.values?.length > 0)
                .length || 0,
        totalValues:
            formattedAttributes.data?.reduce(
                (sum, a) => sum + (a?.values?.length || 0),
                0,
            ) || 0,
        avgValues:
            formattedAttributes.data?.length > 0
                ? Math.round(
                      (formattedAttributes.data?.reduce(
                          (sum, a) => sum + (a?.values?.length || 0),
                          0,
                      ) || 0) / formattedAttributes.data.length,
                  )
                : 0,
    };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attributes" />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Attributes
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage product attributes and their values
                            efficiently
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            href="/admin/attributes/create"
                            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Add New Attribute</span>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Attributes"
                        value={stats.total}
                        color="blue"
                        icon={Tag}
                    />
                    <StatCard
                        title="With Values"
                        value={stats.withValues}
                        color="emerald"
                        icon={Tag}
                    />
                    <StatCard
                        title="Total Values"
                        value={stats.totalValues}
                        color="purple"
                        icon={Tag}
                    />
                    <StatCard
                        title="Avg Values"
                        value={stats.avgValues}
                        color="amber"
                        icon={Tag}
                    />
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <DataTableWrapper
                        fetchUrl="/admin/attributes-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['name', 'slug', 'values.value']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
