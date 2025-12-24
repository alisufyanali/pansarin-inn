import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Shield } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Roles', href: '/admin/roles' },
];

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

interface Props {
  roles?: Role[] | {
    data: Role[];
    total: number;
  };
  stats?: {
    total: number;
    withPermissions: number;
    totalPermissions: number;
    avgPermissions: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_ROLES = {
  data: [],
  total: 0,
};

export default function Index({ roles = DEFAULT_ROLES, stats: propsStats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Convert array to paginated format if needed
  const formattedRoles = Array.isArray(roles) 
    ? { data: roles, total: roles.length }
    : (roles || DEFAULT_ROLES);

  // Define columns using helper
  const columns = [
    CommonColumns.id(),
    CommonColumns.name('Role Name'),
    {
      name: 'Permissions',
      selector: (row: Role) => row.permissions?.length || 0,
      sortable: true,
      cell: (row: Role) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions?.slice(0, 3).map((perm) => (
            <span
              key={perm.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
            >
              {perm.name}
            </span>
          ))}
          {row.permissions && row.permissions.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
              +{row.permissions.length - 3} more
            </span>
          )}
          {(!row.permissions || row.permissions.length === 0) && (
            <span className="text-gray-400 text-sm">No permissions</span>
          )}
        </div>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/roles',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Role Name', key: 'name' },
    { label: 'Permissions Count', key: 'permissions.length' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  // Use stats from props if available, otherwise calculate from data
  const stats = propsStats || {
    total: formattedRoles.total || 0,
    withPermissions: formattedRoles.data?.filter(r => r?.permissions && r.permissions.length > 0).length || 0,
    totalPermissions: formattedRoles.data?.reduce((sum, r) => sum + (r?.permissions?.length || 0), 0) || 0,
    avgPermissions: formattedRoles.data?.length > 0 
      ? Math.round((formattedRoles.data?.reduce((sum, r) => sum + (r?.permissions?.length || 0), 0) || 0) / formattedRoles.data.length)
      : 0,
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Roles
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage user roles and their permissions
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/roles/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Role</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Roles" value={stats.total} color="blue" icon={Shield} />
          <StatCard title="With Permissions" value={stats.withPermissions} color="emerald" icon={Shield} />
          <StatCard title="Total Permissions" value={stats.totalPermissions} color="purple" icon={Shield} />
          <StatCard title="Avg Permissions" value={stats.avgPermissions} color="amber" icon={Shield} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/roles-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'permissions.name']}
          />
        </div>
      </div>
    </AppLayout>
  );
}