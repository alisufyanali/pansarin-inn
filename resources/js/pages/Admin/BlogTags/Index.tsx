import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blog Tags', href: '/admin/blogtags' }, // CHANGED
];

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
  blogs_count: number;
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    active: number;
    inactive: number;
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

  const tagStats = stats || {
    total: 0,
    active: 0,
    inactive: 0,
  };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Tag',
      selector: (row: BlogTag) => row.name,
      sortable: true,
      cell: (row: BlogTag) => (
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: row.color }}
          ></span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {row.name}
          </span>
        </div>
      ),
      width: '200px',
    },
    {
      name: 'Slug',
      selector: (row: BlogTag) => row.slug || '-',
      sortable: true,
      cell: (row: BlogTag) => (
        row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      name: 'Description',
      selector: (row: BlogTag) => row.description || '-',
      sortable: true,
      cell: (row: BlogTag) => (
        <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
          {row.description || <span className="text-gray-400 italic">No description</span>}
        </span>
      ),
      width: '250px',
    },
    {
      name: 'Blog Count',
      selector: (row: BlogTag) => row.blogs_count,
      sortable: true,
      cell: (row: BlogTag) => (
        <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {row.blogs_count} {row.blogs_count === 1 ? 'blog' : 'blogs'}
        </span>
      ),
      width: '120px',
      center: true,
    },
    {
      name: 'Status',
      selector: (row: BlogTag) => row.is_active ? 'Active' : 'Inactive',
      sortable: true,
      cell: (row: BlogTag) => (
        <span className={`px-3 py-1.5 text-xs rounded-full font-medium ${
          row.is_active
            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '120px',
      center: true,
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/blogtags', // FIXED
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Description', key: 'description' },
    { label: 'Color', key: 'color' },
    { label: 'Blog Count', key: 'blogs_count' },
    { label: 'Status', key: 'is_active' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const additionalFilters = [
    {
      name: 'is_active',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blog Tags" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blog Tags
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage tags to organize and categorize your blog posts
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/blogtags/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Tag</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Tags" 
            value={tagStats.total} 
            color="blue" 
            icon={Tag} 
          />
          <StatCard 
            title="Active Tags" 
            value={tagStats.active} 
            color="emerald" 
            icon={CheckCircle} 
          />
          <StatCard 
            title="Inactive Tags" 
            value={tagStats.inactive} 
            color="gray" 
            icon={XCircle} 
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/blogtags-data" // FIXED
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug', 'description']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  color,
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  color: 'blue' | 'emerald' | 'gray';
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
    gray: {
      bg: 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      value: 'text-gray-900 dark:text-gray-100',
      icon: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${classes.bg} border ${classes.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg`}>
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