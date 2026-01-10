import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Mail, UserCheck, UserX } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Newsletter', href: '/admin/newsletters' },
];

interface Newsletter {
  id: number;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source?: string;
  verified_at?: string;
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    active: number;
    verified: number;
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

  const newsletterStats = stats || {
    total: 0,
    active: 0,
    verified: 0,
  };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Email',
      selector: (row: Newsletter) => row.email,
      sortable: true,
      cell: (row: Newsletter) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{row.email}</span>
            {row.name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{row.name}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      name: 'Status',
      selector: (row: Newsletter) => row.status,
      sortable: true,
      cell: (row: Newsletter) => {
        const statusConfig = {
          active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Active' },
          unsubscribed: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Unsubscribed' },
          bounced: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Bounced' },
        };
        const config = statusConfig[row.status];
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      name: 'Verified',
      selector: (row: Newsletter) => row.verified_at || '',
      sortable: true,
      cell: (row: Newsletter) => (
        <div className="flex items-center gap-2">
          {row.verified_at ? (
            <>
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Verified</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">Unverified</span>
            </>
          )}
        </div>
      ),
    },
    {
      name: 'Source',
      selector: (row: Newsletter) => row.source || '-',
      sortable: true,
      cell: (row: Newsletter) => (
        row.source ? <CodeBadge text={row.source} /> : <span className="text-gray-400">-</span>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/newsletters',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Email', key: 'email' },
    { label: 'Name', key: 'name' },
    { label: 'Status', key: 'status' },
    { label: 'Source', key: 'source' },
    { label: 'Verified', key: 'verified_at' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const additionalFilters = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'unsubscribed', label: 'Unsubscribed' },
        { value: 'bounced', label: 'Bounced' },
      ],
    },
    {
      name: 'verified',
      label: 'Verification',
      type: 'select' as const,
      options: [
        { value: 'yes', label: 'Verified' },
        { value: 'no', label: 'Unverified' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Newsletter Subscribers" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Newsletter Subscribers
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your email subscribers
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/newsletters/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Subscriber</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            title="Total Subscribers" 
            value={newsletterStats.total} 
            color="blue" 
            icon={Mail} 
          />
          <StatCard 
            title="Active Subscribers" 
            value={newsletterStats.active} 
            color="emerald" 
            icon={UserCheck} 
          />
          <StatCard 
            title="Verified" 
            value={newsletterStats.verified} 
            color="purple" 
            icon={UserCheck} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/newsletters-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['email', 'name', 'source']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}

// Reusable Stat Card Component
function StatCard({ 
  title, 
  value, 
  color,
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  color: 'blue' | 'emerald' | 'purple';
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