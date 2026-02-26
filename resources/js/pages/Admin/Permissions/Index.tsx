import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Shield, Eye, Plus, Edit, Trash } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Permissions', href: '/admin/permissions' },
];

interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  stats?: {
    total: number;
    view: number;
    create: number;
    edit: number;
    delete: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats: propsStats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;
  const canView = true;

  const stats = propsStats || {
    total: 0,
    view: 0,
    create: 0,
    edit: 0,
    delete: 0,
  };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Permission Name',
      selector: (row: Permission) => row.name,
      sortable: true,
      sortField: 'name',
      cell: (row: Permission) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ID: {row.id}
          </span>
        </div>
      ),
      width: '300px',
    },
    {
      name: 'Guard',
      selector: (row: Permission) => row.guard_name,
      sortable: true,
      sortField: 'guard_name',
      cell: (row: Permission) => <CodeBadge text={row.guard_name} />,
      width: '150px',
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/permissions',
    //   canView,
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Permission Name', key: 'name' },
    { label: 'Guard', key: 'guard_name' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permissions" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Permissions Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage system permissions and access controls
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/permissions/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Permission</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Total Permissions" 
            value={stats.total} 
            color="blue" 
            icon={Shield} 
          />
          <StatCard 
            title="View" 
            value={stats.view} 
            color="emerald" 
            icon={Eye} 
          />
          <StatCard 
            title="Create" 
            value={stats.create} 
            color="purple" 
            icon={Plus} 
          />
          <StatCard 
            title="Edit" 
            value={stats.edit} 
            color="amber" 
            icon={Edit} 
          />
          <StatCard 
            title="Delete" 
            value={stats.delete} 
            color="red" 
            icon={Trash} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/permissions-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'guard_name']}
            // defaultPerPage={10}
          />
        </div>
      </div>
    </AppLayout>
  );
}
