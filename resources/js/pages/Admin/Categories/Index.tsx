import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Filter } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Categories', href: '/admin/categories' },
];

interface Category {
  id: number;
  name: string;
  slug: string;
  status: boolean;
  parent?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  categories?: {
    data: Category[];
    total: number;
  };
  stats?: {
    total: number;
    active: number;
    withParent: number;
    topLevel: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_CATEGORIES = {
  data: [],
  total: 0,
};

export default function Index({ categories = DEFAULT_CATEGORIES, stats: propsStats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  const safeCategories = categories || DEFAULT_CATEGORIES;

  // Define columns using helper
  const columns = [
    CommonColumns.id(),
    CommonColumns.name('Category Name'),
    CommonColumns.slug(),
    {
      name: 'Parent',
      selector: (row: Category) => row.parent?.name || '-',
      sortable: true,
      cell: (row: Category) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.parent?.name || '-'}
        </span>
      ),
    },
    CommonColumns.status(),
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/categories',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Category Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Parent Category', key: 'parent.name' },
    { label: 'Status', key: 'status' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  // Use stats from props if available, otherwise calculate from data
  const stats = propsStats || {
    total: safeCategories.total || 0,
    active: safeCategories.data?.filter(c => c?.status).length || 0,
    withParent: safeCategories.data?.filter(c => c?.parent).length || 0,
    topLevel: safeCategories.data?.filter(c => !c?.parent).length || 0,
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Categories
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and organize your product categories efficiently
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/categories/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Category</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Categories" value={stats.total} color="blue" icon={Filter} />
          <StatCard title="Active Categories" value={stats.active} color="emerald" icon={Filter} />
          <StatCard title="With Parent" value={stats.withParent} color="purple" icon={Filter} />
          <StatCard title="Top Level" value={stats.topLevel} color="amber" icon={Filter} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/categories-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug', 'parent.name']}
          />
        </div>
      </div>
    </AppLayout>
  );
}