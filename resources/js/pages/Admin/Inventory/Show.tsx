import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
  Package, 
  User, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inventory', href: '/admin/inventory' },
  { title: 'View Entry', href: '#' },
];

interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  type: 'in' | 'out';
  reference: string | null;
  note: string | null;
  performed_by: number;
  product: {
    id: number;
    name: string;
    sku: string;
    stock_qty: number;
    stock_alert: number;
    price: number;
    category?: {
      id: number;
      name: string;
    };
  };
  performer?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  inventory: Inventory;
}

export default function Show({ inventory }: Props) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this inventory entry?')) {
      router.delete(`/admin/inventory/${inventory.id}`);
    }
  };

  const isLowStock = inventory.product.stock_qty <= inventory.product.stock_alert && inventory.product.stock_qty > 0;
  const isOutOfStock = inventory.product.stock_qty === 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Inventory Entry #${inventory.id}`} />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/inventory"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inventory Entry #{inventory.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View inventory transaction details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/inventory/${inventory.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Transaction Type Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
            inventory.type === 'in'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {inventory.type === 'in' ? (
              <>
                <TrendingUp className="w-4 h-4" />
                Stock In Transaction
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" />
                Stock Out Transaction
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Product Name</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {inventory.product.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">SKU</label>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {inventory.product.sku}
                  </p>
                </div>

                {inventory.product.category && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Category</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {inventory.product.category.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Price</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Rs. {inventory.product.price.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Current Stock</label>
                  <p className={`text-lg font-bold flex items-center gap-2 ${
                    isOutOfStock ? 'text-red-600 dark:text-red-400' :
                    isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {inventory.product.stock_qty} units
                    {isLowStock && !isOutOfStock && <AlertTriangle className="w-4 h-4" />}
                    {isOutOfStock && <AlertTriangle className="w-4 h-4" />}
                  </p>
                </div>
              </div>

              {(isLowStock || isOutOfStock) && (
                <div className={`p-3 rounded-lg ${
                  isOutOfStock 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}>
                  <p className={`text-sm font-medium ${
                    isOutOfStock ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {isOutOfStock ? '⚠️ Out of Stock!' : '⚠️ Low Stock Alert'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Alert threshold: {inventory.product.stock_alert} units
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transaction Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Quantity</label>
                <p className={`text-3xl font-bold ${
                  inventory.type === 'in' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {inventory.type === 'in' ? '+' : '-'}{Math.abs(inventory.quantity)}
                </p>
              </div>

              {inventory.reference && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Reference Number
                  </label>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {inventory.reference}
                  </p>
                </div>
              )}

              {inventory.note && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Note</label>
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {inventory.note}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <User className="w-4 h-4" />
                  <label className="text-sm">Performed By</label>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {inventory.performer?.name || 'Unknown'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <label className="text-sm">Created</label>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(inventory.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <label className="text-sm">Updated</label>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(inventory.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}