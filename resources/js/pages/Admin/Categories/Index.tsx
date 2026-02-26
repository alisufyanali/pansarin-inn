import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, FolderTree, CheckCircle, Layers, Image as ImageIcon } from 'lucide-react';
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
  image?: string;
  status: boolean;
  parent_id?: number;
  parent?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface Props {
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

export default function Index({ stats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;
  const canView = true;

  const categoryStats = stats || {
    total: 0,
    active: 0,
    withParent: 0,
    topLevel: 0,
  };

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Image',
      selector: (row: Category) => row.image || '',
      sortable: false,
      width: '80px',
      cell: (row: Category) => (
        row.image ? (
          <img 
            src={`/storage/${row.image}`} 
            alt={row.name}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        )
      ),
    },
    {
      name: 'Category Name',
      selector: (row: Category) => row.name,
      sortable: true,
      cell: (row: Category) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.name}
        </span>
      ),
      width: '200px',
    },
    {
      name: 'Slug',
      selector: (row: Category) => row.slug || '-',
      sortable: true,
      cell: (row: Category) => (
        row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      name: 'Parent Category',
      selector: (row: Category) => row.parent?.name || '-',
      sortable: true,
      cell: (row: Category) => (
        row.parent ? (
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {row.parent.name}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Layers className="w-3 h-3" />
            Root Category
          </span>
        )
      ),
      width: '180px',
    },
    {
      name: 'Status',
      selector: (row: Category) => row.status ? 'Active' : 'Inactive',
      sortable: true,
      cell: (row: Category) => (
        <span className={`px-3 py-1.5 text-xs rounded-full font-medium ${
          row.status
            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
        }`}>
          {row.status ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '120px',
      center: true,
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/categories',
      showView: true,
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
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Additional filters
  const additionalFilters = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Product Categories
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
              <span>Add Category</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Categories" 
            value={categoryStats.total} 
            color="blue" 
            icon={FolderTree} 
          />
          <StatCard 
            title="Active" 
            value={categoryStats.active} 
            color="emerald" 
            icon={CheckCircle} 
          />
          <StatCard 
            title="With Parent" 
            value={categoryStats.withParent} 
            color="purple" 
            icon={Layers} 
          />
          <StatCard 
            title="Root Level" 
            value={categoryStats.topLevel} 
            color="amber" 
            icon={FolderTree} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/categories-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'slug', 'parent.name']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}