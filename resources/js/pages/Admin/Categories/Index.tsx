import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Filter } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
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
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_CATEGORIES = {
  data: [],
  total: 0,
};

export default function Index({ categories = DEFAULT_CATEGORIES, flash }: Props) {
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

  // Calculate stats
  const stats = {
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
          <StatCard
            title="Total Categories"
            value={stats.total}
            color="blue"
          />
          <StatCard
            title="Active Categories"
            value={stats.active}
            color="emerald"
          />
          <StatCard
            title="With Parent"
            value={stats.withParent}
            color="purple"
          />
          <StatCard
            title="Top Level"
            value={stats.topLevel}
            color="amber"
          />
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

// Reusable Stat Card Component
function StatCard({ title, value, color }: { title: string; value: number; color: 'blue' | 'emerald' | 'purple' | 'amber' }) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      value: 'text-blue-900 dark:text-blue-100',
      icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-700 dark:text-emerald-300',
      value: 'text-emerald-900 dark:text-emerald-100',
      icon: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-300',
      value: 'text-purple-900 dark:text-purple-100',
      icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
    },
    amber: {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-900 dark:text-amber-100',
      icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${classes.bg} border ${classes.border} rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${classes.text}`}>{title}</p>
          <p className={`mt-2 text-3xl font-bold ${classes.value}`}>{value}</p>
        </div>
        <div className={`p-3 ${classes.icon} rounded-lg`}>
          <Filter className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}