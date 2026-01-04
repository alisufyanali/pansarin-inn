import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { PlusCircle, Image, Layout, Eye } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import toast from "react-hot-toast";

interface FrontendContent {
  id: number;
  type: 'carousel' | 'banner';
  title: string;
  order: number;
  is_active: boolean;
  image?: string;
  link?: string;
  description?: string;
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    carousel: number;
    banner: number;
    active: number;
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

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Frontend Content', href: '/admin/frontend' },
  ];

  const contentStats = stats || {
    total: 0,
    carousel: 0,
    banner: 0,
    active: 0,
  };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Preview',
      selector: (row: FrontendContent) => row.image || '',
      sortable: false,
      width: '80px',
      cell: (row: FrontendContent) => (
        row.image ? (
          <img 
            src={`/storage/${row.image}`} 
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Image className="w-5 h-5 text-gray-400" />
          </div>
        )
      ),
    },
    {
      name: 'Title',
      selector: (row: FrontendContent) => row.title || 'Untitled',
      sortable: true,
      cell: (row: FrontendContent) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {row.title || 'Untitled'}
          </span>
          {row.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {row.description}
            </span>
          )}
        </div>
      ),
      width: '250px',
    },
    {
      name: 'Type',
      selector: (row: FrontendContent) => row.type,
      sortable: true,
      cell: (row: FrontendContent) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.type === 'carousel'
            ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
            : 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
        }`}>
          {row.type}
        </span>
      ),
      width: '120px',
      center: true,
    },
    {
      name: 'Order',
      selector: (row: FrontendContent) => row.order,
      sortable: true,
      cell: (row: FrontendContent) => (
        <span className="text-gray-600 dark:text-gray-400 font-mono">
          {row.order}
        </span>
      ),
      width: '100px',
      center: true,
    },
    {
      name: 'Status',
      selector: (row: FrontendContent) => row.is_active ? 'active' : 'inactive',
      sortable: true,
      cell: (row: FrontendContent) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
      baseUrl: '/admin/frontend',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Title', key: 'title' },
    { label: 'Type', key: 'type' },
    { label: 'Order', key: 'order' },
    { label: 'Status', key: 'is_active' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const additionalFilters = [
    {
      name: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'carousel', label: 'Carousel' },
        { value: 'banner', label: 'Banner' },
      ],
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Frontend Content Management" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Frontend Content
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage carousel and banner images for your website
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/frontend/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Content</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Content" 
            value={contentStats.total} 
            color="blue" 
            icon={Layout} 
          />
          <StatCard 
            title="Carousel" 
            value={contentStats.carousel} 
            color="emerald" 
            icon={Image} 
          />
          <StatCard 
            title="Banners" 
            value={contentStats.banner} 
            color="purple" 
            icon={Layout} 
          />
          <StatCard 
            title="Active" 
            value={contentStats.active} 
            color="amber" 
            icon={Eye} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/frontend-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['title', 'description', 'type']}
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
  color: 'blue' | 'emerald' | 'purple' | 'amber';
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
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}