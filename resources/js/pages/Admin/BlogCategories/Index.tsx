import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, FolderTree, Folder, FolderOpen } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blog Categories', href: '/admin/blogcategories' },
];

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  parent?: { id: number; name: string } | null;
  meta_title?: string;
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    with_parent: number;
    root_categories: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Use stats from props with defaults
  const categoryStats = stats || {
    total: 0,
    with_parent: 0,
    root_categories: 0,
  };

  // Define columns
  const columns = [
    CommonColumns.id(),
    CommonColumns.name('Category Name'),
    {
      name: 'Slug',
      selector: (row: BlogCategory) => row.slug || '-',
      sortable: true,
      cell: (row: BlogCategory) => (
        row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      name: 'Parent Category',
      selector: (row: BlogCategory) => row.parent?.name || '-',
      sortable: true,
      cell: (row: BlogCategory) => (
        <div className="flex items-center gap-2">
          {row.parent ? (
            <>
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">{row.parent.name}</span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Folder className="w-4 h-4" />
              Root Category
            </span>
          )}
        </div>
      ),
    },
    {
      name: 'Meta Title',
      selector: (row: BlogCategory) => row.meta_title || '-',
      sortable: true,
      cell: (row: BlogCategory) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.meta_title || '-'}
        </span>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/blogcategories',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Category Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Parent Category', key: 'parent.name' },
    { label: 'Meta Title', key: 'meta_title' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Additional filters for categories
  const additionalFilters = [
    {
      name: 'parent_id',
      label: 'Category Type',
      type: 'select' as const,
      options: [
        { value: 'root', label: 'Root Categories' },
        { value: 'with_parent', label: 'Sub Categories' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blog Categories" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blog Categories
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Organize your blog content with categories
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/blogcategories/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Category</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            title="Total Categories" 
            value={categoryStats.total} 
            color="blue" 
            icon={FolderTree} 
          />
          <StatCard 
            title="Root Categories" 
            value={categoryStats.root_categories} 
            color="emerald" 
            icon={Folder} 
          />
          <StatCard 
            title="Sub Categories" 
            value={categoryStats.with_parent} 
            color="purple" 
            icon={FolderOpen} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/blogcategories-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug', 'meta_title', 'parent.name']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}

// Reusable Stat Card Component
function StatCard({ 
  title, 
  value, 
  color,
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  color: 'blue' | 'emerald' | 'purple';
  icon: any;
}) {
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
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}