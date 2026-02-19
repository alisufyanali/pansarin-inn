import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, FolderTree, Folder, FolderOpen } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
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

  const categoryStats = stats || { total: 0, with_parent: 0, root_categories: 0 };

  const columns = [
    CommonColumns.id(),
    CommonColumns.name('Category Name'),
    {
      name: 'Slug',
      selector: (row: BlogCategory) => row.slug || '-',
      sortable: true,
      cell: (row: BlogCategory) => row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>,
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
    CommonColumns.createdAt(true),
    CommonColumns.actions({ baseUrl: '/admin/blogcategories', canEdit, canDelete }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Category Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Parent Category', key: 'parent.name' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blog Categories" />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Categories</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Organize your blog content with categories</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Categories" value={categoryStats.total} color="blue" icon={FolderTree} />
          <StatCard title="Root Categories" value={categoryStats.root_categories} color="emerald" icon={Folder} />
          <StatCard title="Sub Categories" value={categoryStats.with_parent} color="purple" icon={FolderOpen} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/blogcategories-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug', 'parent.name']}
          />
        </div>
      </div>
    </AppLayout>
  );
}