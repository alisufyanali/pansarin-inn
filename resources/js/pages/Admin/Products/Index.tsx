import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Filter, Package } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge, StatusBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Products', href: '/admin/products' },
];

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  status: boolean;
  featured: boolean;
  category?: { id: number; name: string };
  vendor?: { id: number; shop_name: string };
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    active: number;
    featured: number;
    onSale: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats, flash }: Props) {
  const canCreate = true; // can('create.products');
  const canEdit = true; // can('edit.products');
  const canDelete = true; // can('delete.products');

  // Use stats from props with defaults
  const productStats = stats || {
    total: 0,
    active: 0,
    featured: 0,
    onSale: 0,
  };

  // Define columns
  const columns = [
    CommonColumns.id(),
    CommonColumns.name('Product Name'),
    {
      name: 'SKU',
      selector: (row: Product) => row.sku || '-',
      sortable: true,
      cell: (row: Product) => (
        row.sku ? <CodeBadge text={row.sku} /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      name: 'Category',
      selector: (row: Product) => row.category?.name || '-',
      sortable: true,
      cell: (row: Product) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.category?.name || '-'}
        </span>
      ),
    },
    {
      name: 'Price',
      selector: (row: Product) => row.price,
      sortable: true,
      cell: (row: Product) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Rs. {parseFloat(row.price as any).toFixed(2)}
          </span>
          {row.sale_price && (
            <span className="text-xs text-green-600 dark:text-green-400">
              Sale: Rs. {parseFloat(row.sale_price as any).toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    CommonColumns.status(),
    {
      name: 'Featured',
      selector: (row: Product) => row.featured ? 'Yes' : 'No',
      sortable: true,
      cell: (row: Product) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.featured 
            ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
            : 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
        }`}>
          {row.featured ? 'Yes' : 'No'}
        </span>
      ),
      width: '100px',
      center: true,
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/products',
      canEdit,
      canDelete,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Product Name', key: 'name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Category', key: 'category.name' },
    { label: 'Vendor', key: 'vendor.shop_name' },
    { label: 'Price', key: 'price' },
    { label: 'Sale Price', key: 'sale_price' },
    { label: 'Status', key: 'status' },
    { label: 'Featured', key: 'featured' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Additional filters for products
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
      name: 'featured',
      label: 'Featured',
      type: 'select' as const,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Products" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your product inventory and pricing
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Product</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Products" value={productStats.total} color="blue" icon={Package} />
          <StatCard title="Active Products" value={productStats.active} color="emerald" icon={Package} />
          <StatCard title="Featured" value={productStats.featured} color="amber" icon={Package} />
          <StatCard title="On Sale" value={productStats.onSale} color="purple" icon={Package} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/products-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'sku', 'category.name', 'vendor.shop_name']}
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