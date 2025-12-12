import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Package2, Layers } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Product Variants', href: '/admin/product-variants' },
];

interface Variant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  status: boolean;
  is_default: boolean;
  attributes?: Record<string, string>;
  product?: { id: number; name: string };
  created_at: string;
}

interface Props {
  variants?: {
    data: Variant[];
    total: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const DEFAULT_VARIANTS = {
  data: [],
  total: 0,
};

export default function Index({ variants = DEFAULT_VARIANTS, flash }: Props) {
  const canCreate = true; // can('create.variants');
  const canEdit = true; // can('edit.variants');
  const canDelete = true; // can('delete.variants');

  const safeVariants = variants || DEFAULT_VARIANTS;

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Product',
      selector: (row: Variant) => row.product?.name || '-',
      sortable: true,
      cell: (row: Variant) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.product?.name || '-'}
        </span>
      ),
      grow: 2,
    },
    {
      name: 'SKU',
      selector: (row: Variant) => row.sku,
      sortable: true,
      cell: (row: Variant) => <CodeBadge text={row.sku} />,
    },
    {
      name: 'Attributes',
      selector: (row: Variant) => row.attributes ? Object.values(row.attributes).join(', ') : '-',
      cell: (row: Variant) => (
        <div className="text-sm">
          {row.attributes && Object.keys(row.attributes).length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {Object.entries(row.attributes).map(([key, value]) => (
                <span key={key} className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                  {key}: {value}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      name: 'Price',
      selector: (row: Variant) => row.price,
      sortable: true,
      cell: (row: Variant) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Rs. {parseFloat(row.price as any).toFixed(2)}
        </span>
      ),
    },
    {
      name: 'Stock',
      selector: (row: Variant) => row.stock,
      sortable: true,
      cell: (row: Variant) => (
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
          row.stock > 10
            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
            : row.stock > 0
            ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
            : 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {row.stock}
        </span>
      ),
      width: '100px',
      center: true,
    },
    {
      name: 'Default',
      selector: (row: Variant) => row.is_default ? 'Yes' : 'No',
      sortable: true,
      cell: (row: Variant) => (
        row.is_default ? (
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
            Default
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      ),
      width: '100px',
      center: true,
    },
    CommonColumns.status(),
    CommonColumns.createdAt(false),
    CommonColumns.actions({
      baseUrl: '/admin/product-variants',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Product', key: 'product.name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Price', key: 'price' },
    { label: 'Stock', key: 'stock' },
    { label: 'Is Default', key: 'is_default' },
    { label: 'Status', key: 'status' },
    { label: 'Created At', key: 'created_at' },
  ];

  // Calculate stats
  const stats = {
    total: safeVariants.total || 0,
    active: safeVariants.data?.filter(v => v?.status).length || 0,
    inStock: safeVariants.data?.filter(v => v?.stock > 0).length || 0,
    default: safeVariants.data?.filter(v => v?.is_default).length || 0,
  };

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
    {
      name: 'stock_status',
      label: 'Stock Status',
      type: 'select' as const,
      options: [
        { value: 'in_stock', label: 'In Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' },
      ],
    },
    {
      name: 'is_default',
      label: 'Default',
      type: 'select' as const,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Product Variants" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Product Variants
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage product variations, sizes, and options
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/product-variants/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Variant</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Variants" value={stats.total} color="blue" icon={Layers} />
          <StatCard title="Active Variants" value={stats.active} color="emerald" icon={Package2} />
          <StatCard title="In Stock" value={stats.inStock} color="purple" icon={Package2} />
          <StatCard title="Default Variants" value={stats.default} color="amber" icon={Layers} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/product-variants-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['sku', 'product.name', 'price', 'stock']}
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