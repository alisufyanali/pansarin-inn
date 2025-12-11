import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle, Filter, Download } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import DeleteConfirm from '@/components/DeleteConfirm';
import toast from "react-hot-toast";
import { route } from "ziggy-js"; // ✅ correct

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
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters?: {
    search?: string;
    status?: string;
    parent_id?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

// Default empty data structure
const DEFAULT_CATEGORIES = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
};

export default function Index({
  categories = DEFAULT_CATEGORIES,
  filters = {},
  flash
}: Props) {
  const canCreate = true  ; //can('create.categories');
  const canEdit = true  ; //can('edit.categories');
  const canDelete = true  ; //can('delete.categories');


  // Use safe data
  const safeCategories = categories || DEFAULT_CATEGORIES;

  // Status options with colors
  const statusOptions: StatusOption[] = [
    { value: 'active', label: 'Active', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
    { value: 'inactive', label: 'Inactive', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-500/10 dark:bg-red-500/20' },
  ];

  const columns = [
    {
      name: 'ID',
      selector: (row: Category) => row.id,
      sortable: true,
      width: '80px',
      center: true,
    },
    {
      name: 'Category Name',
      selector: (row: Category) => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Slug',
      selector: (row: Category) => row.slug,
      sortable: true,
      cell: (row: Category) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {row.slug}
        </code>
      ),
    },
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
    {
      name: 'Status',
      selector: (row: Category) => row.status ? 'Active' : 'Inactive',
      sortable: true,
      cell: (row: Category) => {
        const status = row.status ? 'active' : 'inactive';
        const option = statusOptions.find(opt => opt.value === status);
        return (
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${option?.bgColor} ${option?.color}`}>
            {row.status ? 'Active' : 'Inactive'}
          </span>
        );
      },
      width: '120px',
      center: true,
    },
    {
      name: 'Created',
      selector: (row: Category) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
      cell: (row: Category) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.created_at).toLocaleDateString()}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: (row: Category, reloadData: () => void) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/categories/${row.id}`}
            className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {canEdit ? (
            <Link
              href={`/admin/categories/${row.id}/edit`}
              className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-colors"
              title="Edit Category"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          ) : (
            <button
              className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              title="Edit (disabled)"
              disabled
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {canDelete ? (
            <DeleteConfirm
              id={row.id}
              url={`/admin/categories/${row.id}`}
            >
              <Trash2 size={16} />
            </DeleteConfirm>

          ) : (
            <button
              className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              title="Delete (disabled)"
              disabled
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '180px',
      center: true,
    },
  ];

  // CSV headers
  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Category Name', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Parent Category', key: 'parent.name' },
    { label: 'Status', key: 'status' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  // Calculate stats safely
  const calculateStats = () => {
    const data = safeCategories.data || [];
    return {
      total: safeCategories.total || 0,
      active: data.filter(c => c?.status).length,
      withParent: data.filter(c => c?.parent).length,
      topLevel: data.filter(c => !c?.parent).length,
    };
  };

  const stats = calculateStats();

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }

    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />

      <div className="flex flex-col gap-8">
        {/* Header Section */}
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
            <div className="flex items-center gap-3">
              <Link
                href="/admin/categories/create"
                className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add New Category</span>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Categories</p>
                <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <Filter className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active Categories</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.active}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                <Filter className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">With Parent</p>
                <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.withParent}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Top Level</p>
                <p className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.topLevel}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <Filter className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
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