import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Package, AlertTriangle, TrendingDown, TrendingUp, DollarSign, ClipboardList } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inventory', href: '/admin/inventory' },
];

interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  type: 'in' | 'out';
  reference: string | null;
  note: string | null;
  performed_by: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    stock_qty: number;
    stock_alert: number;
    price: number;
    category?: { id: number; name: string };
  };
  performer?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Props {
  stats?: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    totalEntries: number;
    stockIn: number;
    stockOut: number;
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
  const canView = true;

  const inventoryStats = stats || {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalEntries: 0,
    stockIn: 0,
    stockOut: 0,
  };

  const columns = [
    CommonColumns.id(),
    {
      name: 'Product',
      selector: (row: Inventory) => row.product?.name || '-',
      sortable: true,
      cell: (row: Inventory) => (
        <div className="flex flex-col py-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.product?.name || '-'}
          </span>
          {row.product?.sku && (
            <CodeBadge text={row.product.sku} />
          )}
          {row.product?.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {row.product.category.name}
            </span>
          )}
        </div>
      ),
      width: '250px',
    },
    {
      name: 'Type',
      selector: (row: Inventory) => row.type,
      sortable: true,
      cell: (row: Inventory) => (
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
          row.type === 'in'
            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {row.type === 'in' ? '📥 Stock In' : '📤 Stock Out'}
        </span>
      ),
      width: '130px',
      center: true,
    },
    {
      name: 'Quantity',
      selector: (row: Inventory) => Math.abs(row.quantity),
      sortable: true,
      cell: (row: Inventory) => (
        <span className={`font-semibold text-lg ${
          row.type === 'in' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {row.type === 'in' ? '+' : '-'}{Math.abs(row.quantity)}
        </span>
      ),
      width: '100px',
      center: true,
    },
    {
      name: 'Current Stock',
      selector: (row: Inventory) => row.product?.stock_qty || 0,
      sortable: true,
      cell: (row: Inventory) => {
        const stock = row.product?.stock_qty || 0;
        const alert = row.product?.stock_alert || 10;
        const isLow = stock <= alert && stock > 0;
        const isOut = stock === 0;

        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              isOut ? 'text-red-600 dark:text-red-400' :
              isLow ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-900 dark:text-gray-100'
            }`}>
              {stock}
            </span>
            {isLow && !isOut && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            {isOut && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        );
      },
      width: '140px',
      center: true,
    },
    {
      name: 'Reference',
      selector: (row: Inventory) => row.reference || '-',
      sortable: true,
      cell: (row: Inventory) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.reference || '-'}
        </span>
      ),
    },
    {
      name: 'Performed By',
      selector: (row: Inventory) => row.performer?.name || '-',
      sortable: true,
      cell: (row: Inventory) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.performer?.name || '-'}
        </span>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/inventory',
      canEdit,
      canDelete,
    //   canView,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Product', key: 'product.name' },
    { label: 'SKU', key: 'product.sku' },
    { label: 'Category', key: 'product.category.name' },
    { label: 'Type', key: 'type' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Current Stock', key: 'product.stock_qty' },
    { label: 'Reference', key: 'reference' },
    { label: 'Note', key: 'note' },
    { label: 'Performed By', key: 'performer.name' },
    { label: 'Date', key: 'created_at' },
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
        { value: 'in', label: 'Stock In' },
        { value: 'out', label: 'Stock Out' },
      ],
    },
    {
      name: 'low_stock',
      label: 'Stock Status',
      type: 'select' as const,
      options: [
        { value: 'yes', label: 'Low Stock Only' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inventory Management" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventory Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and manage product stock levels
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/inventory/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Stock Entry</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Products" 
            value={inventoryStats.totalProducts} 
            color="blue" 
            icon={Package} 
          />
          <StatCard 
            title="Low Stock Items" 
            value={inventoryStats.lowStock} 
            color="amber" 
            icon={AlertTriangle} 
          />
          <StatCard 
            title="Out of Stock" 
            value={inventoryStats.outOfStock} 
            color="red" 
            icon={TrendingDown} 
          />
          <StatCard 
            title="Inventory Value" 
            value={`Rs. ${inventoryStats.totalValue.toLocaleString()}`} 
            color="emerald" 
            icon={DollarSign} 
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            title="Total Entries" 
            value={inventoryStats.totalEntries} 
            color="purple" 
            icon={ClipboardList} 
          />
          <StatCard 
            title="Total Stock In" 
            value={inventoryStats.stockIn} 
            color="green" 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Total Stock Out" 
            value={inventoryStats.stockOut} 
            color="orange" 
            icon={TrendingDown} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/inventory-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['product.name', 'product.sku', 'reference', 'note']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  color,
  icon: Icon 
}: { 
  title: string; 
  value: number | string; 
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'green' | 'orange';
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
    amber: {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-900 dark:text-amber-100',
      icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
    },
    red: {
      bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      value: 'text-red-900 dark:text-red-100',
      icon: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-300',
      value: 'text-purple-900 dark:text-purple-100',
      icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
    },
    green: {
      bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      value: 'text-green-900 dark:text-green-100',
      icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
    },
    orange: {
      bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      border: 'border-orange-200 dark:border-orange-700',
      text: 'text-orange-700 dark:text-orange-300',
      value: 'text-orange-900 dark:text-orange-100',
      icon: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300',
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