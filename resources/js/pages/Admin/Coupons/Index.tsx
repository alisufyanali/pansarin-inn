import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Ticket, Percent, DollarSign, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Coupons', href: '/admin/coupons' },
];

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  apply_to: 'order' | 'product' | 'category';
  product_id: number | null;
  category_id: number | null;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  product?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Stats {
  total: number;
  active: number;
  percentage: number;
  fixed: number;
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
      name: 'Coupon Code',
      selector: (row: Coupon) => row.code,
      sortable: true,
      cell: (row: Coupon) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
            {row.code}
          </span>
          {row.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {row.description.substring(0, 50)}{row.description.length > 50 ? '...' : ''}
            </span>
          )}
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Discount',
      selector: (row: Coupon) => row.discount_value,
      sortable: true,
      cell: (row: Coupon) => (
        <div className="flex items-center gap-2">
          {row.discount_type === 'percentage' ? (
            <>
              <Percent className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {row.discount_value}%
              </span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                PKR {row.discount_value}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      name: 'Apply To',
      selector: (row: Coupon) => row.apply_to,
      sortable: true,
      cell: (row: Coupon) => (
        <div className="flex flex-col">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            row.apply_to === 'order' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
              : row.apply_to === 'product'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {row.apply_to.charAt(0).toUpperCase() + row.apply_to.slice(1)}
          </span>
          {row.apply_to === 'product' && row.product && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {row.product.name}
            </span>
          )}
          {row.apply_to === 'category' && row.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {row.category.name}
            </span>
          )}
        </div>
      ),
    },
    {
      name: 'Usage',
      selector: (row: Coupon) => row.usage_count,
      sortable: true,
      cell: (row: Coupon) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.usage_count} / {row.usage_limit || '∞'}
          </span>
          {row.usage_limit && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((row.usage_count / row.usage_limit) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      name: 'Validity',
      selector: (row: Coupon) => row.start_date || '',
      sortable: true,
      cell: (row: Coupon) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {row.start_date && (
            <div>From: {new Date(row.start_date).toLocaleDateString()}</div>
          )}
          {row.end_date && (
            <div>To: {new Date(row.end_date).toLocaleDateString()}</div>
          )}
          {!row.start_date && !row.end_date && (
            <div>No expiry</div>
          )}
        </div>
      ),
    },
    {
      name: 'Status',
      selector: (row: Coupon) => row.is_active,
      sortable: true,
      cell: (row: Coupon) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.is_active
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/coupons',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Code', key: 'code' },
    { label: 'Description', key: 'description' },
    { label: 'Discount Type', key: 'discount_type' },
    { label: 'Discount Value', key: 'discount_value' },
    { label: 'Apply To', key: 'apply_to' },
    { label: 'Product', key: 'product.name' },
    { label: 'Category', key: 'category.name' },
    { label: 'Min Purchase', key: 'min_purchase_amount' },
    { label: 'Usage Count', key: 'usage_count' },
    { label: 'Usage Limit', key: 'usage_limit' },
    { label: 'Start Date', key: 'start_date' },
    { label: 'End Date', key: 'end_date' },
    { label: 'Status', key: 'is_active' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Coupons" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Coupons
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage discount coupons and promotional codes
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/coupons/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Coupon</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Coupons" value={stats.total} color="blue" icon={Ticket} />
          <StatCard title="Active" value={stats.active} color="emerald" icon={TrendingUp} />
          <StatCard title="Percentage" value={stats.percentage} color="purple" icon={Percent} />
          <StatCard title="Fixed Amount" value={stats.fixed} color="amber" icon={DollarSign} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/coupons-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['code', 'description', 'discount_type', 'apply_to']}
          />
        </div>
      </div>
    </AppLayout>
  );
}