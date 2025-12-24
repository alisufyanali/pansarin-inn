import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Users as UsersIcon } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Users', href: '/admin/users' },
];

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
  created_at: string;
  updated_at: string;
}

interface Props {
  users?: User[] | {
    data: User[];
    total: number;
  };
  stats?: {
    total: number;
    admins: number;
    vendors: number;
    customers: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_USERS = {
  data: [],
  total: 0,
};

export default function Index({ users = DEFAULT_USERS, stats: propsStats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Convert array to paginated format if needed
  const formattedUsers = Array.isArray(users) 
    ? { data: users, total: users.length }
    : (users || DEFAULT_USERS);

  // Define columns using helper
  const columns = [
    CommonColumns.id(),
    CommonColumns.name('User Name'),
    {
      name: 'Email',
      selector: (row: User) => row.email,
      sortable: true,
      cell: (row: User) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.email}
        </span>
      ),
    },
    {
      name: 'Role',
      selector: (row: User) => row.roles?.map(r => r.name).join(', ') || '-',
      sortable: true,
      cell: (row: User) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((role) => (
            <span
              key={role.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
            >
              {role.name}
            </span>
          ))}
          {(!row.roles || row.roles.length === 0) && (
            <span className="text-gray-400 text-sm">No role</span>
          )}
        </div>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/users',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'User Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'roles.0.name' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  // Use stats from props if available, otherwise calculate from data
  const stats = propsStats || {
    total: formattedUsers.total || 0,
    admins: formattedUsers.data?.filter(u => u?.roles?.some(r => r.name === 'admin')).length || 0,
    vendors: formattedUsers.data?.filter(u => u?.roles?.some(r => r.name === 'vendor')).length || 0,
    customers: formattedUsers.data?.filter(u => u?.roles?.some(r => r.name === 'customer')).length || 0,
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage user accounts and their roles
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New User</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.total} color="blue" icon={UsersIcon} />
          <StatCard title="Admins" value={stats.admins} color="emerald" icon={UsersIcon} />
          <StatCard title="Vendors" value={stats.vendors} color="purple" icon={UsersIcon} />
          <StatCard title="Customers" value={stats.customers} color="amber" icon={UsersIcon} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/users-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'email', 'roles.name']}
          />
        </div>
      </div>
    </AppLayout>
  );
}