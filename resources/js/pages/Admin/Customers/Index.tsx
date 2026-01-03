import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Users, MapPin, Phone, Mail } from 'lucide-react';
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
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city_id: number | null;
  country: string | null;
  city?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Stats {
  total: number;
  withEmail: number;
  cities: number;
  countries: number;
}

interface Props {
  stats: Stats;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Customer Name',
      selector: (row: Customer) => `${row.first_name} ${row.last_name || ''}`.trim(),
      sortable: true,
      cell: (row: Customer) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {`${row.first_name} ${row.last_name || ''}`.trim()}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Email',
      selector: (row: Customer) => row.email || '-',
      sortable: true,
      cell: (row: Customer) => (
        <div className="flex items-center gap-1">
          {row.email ? (
            <>
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {row.email}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
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
      selector: (row: Customer) => row.city?.name || '-',
      sortable: true,
      cell: (row: Customer) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.city?.name || '-'}
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
    { label: 'First Name', key: 'first_name' },
    { label: 'Last Name', key: 'last_name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city.name' },
    { label: 'Country', key: 'country' },
    { label: 'Created At', key: 'created_at' },
  ];

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
          <StatCard title="With Email" value={stats.withEmail} color="emerald" icon={Mail} />
          <StatCard title="Cities" value={stats.cities} color="purple" icon={MapPin} />
          <StatCard title="Countries" value={stats.countries} color="amber" icon={MapPin} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/customers-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['first_name', 'last_name', 'phone', 'email', 'address', 'city.name', 'country']}
          />
        </div>
      </div>
    </AppLayout>
  );
}