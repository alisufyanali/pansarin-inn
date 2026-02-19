import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blog Tags', href: '/admin/blogtags' },
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

  const tagStats = stats || { total: 0, active: 0, inactive: 0 };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Tag',
      selector: (row: BlogTag) => row.name,
      sortable: true,
      cell: (row: BlogTag) => (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></span>
          <span className="font-semibold text-gray-900 dark:text-white">{row.name}</span>
        </div>
      ),
      width: '200px',
    },
    {
      name: 'Slug',
      selector: (row: BlogTag) => row.slug || '-',
      sortable: true,
      cell: (row: BlogTag) => row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>,
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
    CommonColumns.actions({ baseUrl: '/admin/blogtags', canEdit, canDelete }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Color', key: 'color' },
    { label: 'Blog Count', key: 'blogs_count' },
    { label: 'Status', key: 'is_active' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blog Tags" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Tags</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage tags to organize and categorize your blog posts</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Tags" value={tagStats.total} color="blue" icon={Tag} />
          <StatCard title="Active Tags" value={tagStats.active} color="emerald" icon={CheckCircle} />
          <StatCard title="Inactive Tags" value={tagStats.inactive} color="red" icon={XCircle} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/blogtags-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug']}
          />
        </div>
      </div>
    </AppLayout>
  );
}