import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Users, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
];

interface Customer {
  id: number;
  user_id: number;
  address: string | null;
  city: string | null;
  country: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

interface Props {
  customers?: {
    data: Customer[];
    total: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_CUSTOMERS = {
  data: [],
  total: 0,
};

export default function Index({ customers = DEFAULT_CUSTOMERS, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  const safeCustomers = customers || DEFAULT_CUSTOMERS;

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Customer Name',
      selector: (row: Customer) => row.user?.name || '-',
      sortable: true,
      cell: (row: Customer) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.user?.name || '-'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.user?.email || '-'}
          </span>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Address',
      selector: (row: Customer) => row.address || '-',
      sortable: true,
      cell: (row: Customer) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.address || '-'}
        </span>
      ),
    },
    {
      name: 'City',
      selector: (row: Customer) => row.city || '-',
      sortable: true,
      cell: (row: Customer) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.city || '-'}
          </span>
        </div>
      ),
    },
    {
      name: 'Country',
      selector: (row: Customer) => row.country || '-',
      sortable: true,
      cell: (row: Customer) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.country || '-'}
        </span>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/customers',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Customer Name', key: 'user.name' },
    { label: 'Email', key: 'user.email' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city' },
    { label: 'Country', key: 'country' },
    { label: 'Created At', key: 'created_at' },
  ];

  // Calculate stats
  const stats = {
    total: safeCustomers.total || 0,
    withAddress: safeCustomers.data?.filter(c => c?.address).length || 0,
    cities: new Set(safeCustomers.data?.map(c => c?.city).filter(Boolean)).size,
    countries: new Set(safeCustomers.data?.map(c => c?.country).filter(Boolean)).size,
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Customers" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customers
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your customer database and information
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/customers/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Customer</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Customers" value={stats.total} color="blue" icon={Users} />
          <StatCard title="With Address" value={stats.withAddress} color="emerald" icon={MapPin} />
          <StatCard title="Cities" value={stats.cities} color="purple" icon={MapPin} />
          <StatCard title="Countries" value={stats.countries} color="amber" icon={MapPin} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/customers-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['user.name', 'user.email', 'address', 'city', 'country']}
          />
        </div>
      </div>
    </AppLayout>
  );
}