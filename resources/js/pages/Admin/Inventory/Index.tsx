import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Package, AlertTriangle, TrendingDown, TrendingUp, DollarSign, ClipboardList } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inventory', href: '/admin/inventory' }];

interface InventoryRow {
    id: number;
    type: 'in' | 'out' | 'adjustment' | 'return';
    quantity: number;
    cost_price: number | null;
    reference: string | null;
    source: string | null;
    current_stock: number;
    stock_alert: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
    product?: { id: number; name: string; sku: string; unit?: string; category?: { name: string } };
    variant?: { id: number; sku: string; value: string };
    created_at: string;
}

interface Stats {
    totalProducts: number; lowStock: number; outOfStock: number;
    totalValue: number; totalEntries: number; stockIn: number; stockOut: number;
}

interface Props {
    stats?: Stats;
    flash?: { success?: string; error?: string };
}

const TYPE_STYLES: Record<string, string> = {
    in:         'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    out:        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    adjustment: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    return:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};
const TYPE_LABELS: Record<string, string> = {
    in: '📥 In', out: '📤 Out', adjustment: '⚙️ Adj', return: '↩️ Return',
};

export default function Index({ stats, flash }: Props) {
    const inventoryStats: Stats = stats || { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0, totalEntries: 0, stockIn: 0, stockOut: 0 };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const columns = [
        CommonColumns.id(),
        {
            name: 'Product',
            selector: (row: InventoryRow) => row.product?.name || '-',
            sortable: true,
            minWidth: '220px',
            cell: (row: InventoryRow) => (
                <div className="py-1.5">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{row.product?.name || '-'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {row.product?.sku && <CodeBadge text={row.variant?.sku || row.product.sku} />}
                    </div>
                    {row.variant && (
                        <p className="text-xs text-indigo-500 mt-0.5">{row.variant.value}</p>
                    )}
                    {row.product?.category && (
                        <p className="text-xs text-gray-400 mt-0.5">{row.product.category.name}</p>
                    )}
                </div>
            ),
        },
        {
            name: 'Type',
            selector: (row: InventoryRow) => row.type,
            sortable: true,
            width: '110px',
            center: true,
            cell: (row: InventoryRow) => (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${TYPE_STYLES[row.type] || ''}`}>
                    {TYPE_LABELS[row.type] || row.type}
                </span>
            ),
        },
        {
            name: 'Qty',
            selector: (row: InventoryRow) => Math.abs(row.quantity),
            sortable: true,
            width: '90px',
            center: true,
            cell: (row: InventoryRow) => (
                <span className={`font-bold text-base ${['in','return'].includes(row.type) ? 'text-green-600' : 'text-red-600'}`}>
                    {['in','return'].includes(row.type) ? '+' : '-'}{Math.abs(row.quantity)}
                </span>
            ),
        },
        {
            name: 'Stock Now',
            selector: (row: InventoryRow) => row.current_stock,
            sortable: true,
            width: '110px',
            center: true,
            cell: (row: InventoryRow) => (
                <div className="flex items-center gap-1">
                    <span className={`font-semibold ${
                        row.is_out_of_stock ? 'text-red-600' : row.is_low_stock ? 'text-yellow-600' : 'text-gray-900 dark:text-gray-100'
                    }`}>{row.current_stock}</span>
                    {(row.is_low_stock || row.is_out_of_stock) && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                </div>
            ),
        },
        {
            name: 'Cost Price',
            selector: (row: InventoryRow) => row.cost_price || '-',
            sortable: true,
            width: '110px',
            cell: (row: InventoryRow) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {row.cost_price ? `Rs. ${row.cost_price}` : '-'}
                </span>
            ),
        },
        {
            name: 'Reference',
            selector: (row: InventoryRow) => row.reference || '-',
            sortable: true,
            cell: (row: InventoryRow) => <span className="text-gray-500 text-sm">{row.reference || '-'}</span>,
        },
        CommonColumns.createdAt(true),
        CommonColumns.actions({ baseUrl: '/admin/inventory', canEdit: true, canDelete: true }),
    ];

    const csvHeaders = [
        { label: 'ID', key: 'id' }, { label: 'Product', key: 'product.name' },
        { label: 'SKU', key: 'product.sku' }, { label: 'Variant', key: 'variant.value' },
        { label: 'Type', key: 'type' }, { label: 'Qty', key: 'quantity' },
        { label: 'Stock Now', key: 'current_stock' }, { label: 'Cost Price', key: 'cost_price' },
        { label: 'Reference', key: 'reference' }, { label: 'Source', key: 'source' },
        { label: 'Date', key: 'created_at' },
    ];

    const additionalFilters = [
        { name: 'type', label: 'Type', type: 'select' as const, options: [
            { value: 'in', label: 'Stock In' }, { value: 'out', label: 'Stock Out' },
            { value: 'adjustment', label: 'Adjustment' }, { value: 'return', label: 'Return' },
        ]},
        { name: 'low_stock', label: 'Stock Alert', type: 'select' as const, options: [
            { value: 'yes', label: 'Low Stock Only' },
        ]},
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Track stock movements and levels</p>
                    </div>
                    <Link href="/admin/inventory/create"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition shadow-lg hover:scale-[1.02]">
                        <PlusCircle className="w-5 h-5" /> Add Stock Entry
                    </Link>
                </div>

                {/* Stats Row 1 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Products"   value={inventoryStats.totalProducts} color="blue"    icon={Package} />
                    <StatCard title="Low Stock"        value={inventoryStats.lowStock}      color="amber"   icon={AlertTriangle} />
                    <StatCard title="Out of Stock"     value={inventoryStats.outOfStock}    color="red"     icon={TrendingDown} />
                    <StatCard title="Inventory Value"  value={`Rs. ${Number(inventoryStats.totalValue).toLocaleString()}`} color="emerald" icon={DollarSign} />
                </div>

                {/* Stats Row 2 */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard title="Total Entries" value={inventoryStats.totalEntries} color="purple" icon={ClipboardList} />
                    <StatCard title="Total Stock In"  value={inventoryStats.stockIn}    color="green"  icon={TrendingUp} />
                    <StatCard title="Total Stock Out" value={inventoryStats.stockOut}   color="orange" icon={TrendingDown} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <DataTableWrapper
                        fetchUrl="/admin/inventory-data"
                        columns={columns}
                        csvHeaders={csvHeaders}
                        searchableKeys={['product.name', 'product.sku', 'reference']}
                        additionalFilters={additionalFilters}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

// ── StatCard ──────────────────────────────────────────────────────
type Color = 'blue'|'emerald'|'amber'|'red'|'purple'|'green'|'orange';
const colorMap: Record<Color, { bg: string; border: string; text: string; value: string; icon: string }> = {
    blue:    { bg:'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',       border:'border-blue-200 dark:border-blue-700',    text:'text-blue-700 dark:text-blue-300',    value:'text-blue-900 dark:text-blue-100',    icon:'bg-blue-100 dark:bg-blue-800 text-blue-600' },
    emerald: { bg:'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20', border:'border-emerald-200 dark:border-emerald-700', text:'text-emerald-700 dark:text-emerald-300', value:'text-emerald-900 dark:text-emerald-100', icon:'bg-emerald-100 dark:bg-emerald-800 text-emerald-600' },
    amber:   { bg:'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',   border:'border-amber-200 dark:border-amber-700',  text:'text-amber-700 dark:text-amber-300',  value:'text-amber-900 dark:text-amber-100',  icon:'bg-amber-100 dark:bg-amber-800 text-amber-600' },
    red:     { bg:'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',           border:'border-red-200 dark:border-red-700',      text:'text-red-700 dark:text-red-300',      value:'text-red-900 dark:text-red-100',      icon:'bg-red-100 dark:bg-red-800 text-red-600' },
    purple:  { bg:'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', border:'border-purple-200 dark:border-purple-700', text:'text-purple-700 dark:text-purple-300', value:'text-purple-900 dark:text-purple-100', icon:'bg-purple-100 dark:bg-purple-800 text-purple-600' },
    green:   { bg:'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',   border:'border-green-200 dark:border-green-700',  text:'text-green-700 dark:text-green-300',  value:'text-green-900 dark:text-green-100',  icon:'bg-green-100 dark:bg-green-800 text-green-600' },
    orange:  { bg:'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20', border:'border-orange-200 dark:border-orange-700', text:'text-orange-700 dark:text-orange-300', value:'text-orange-900 dark:text-orange-100', icon:'bg-orange-100 dark:bg-orange-800 text-orange-600' },
};

function StatCard({ title, value, color, icon: Icon }: { title: string; value: number | string; color: Color; icon: any }) {
    const c = colorMap[color];
    return (
        <div className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-xs font-medium ${c.text}`}>{title}</p>
                    <p className={`mt-1.5 text-2xl font-bold ${c.value}`}>{value}</p>
                </div>
                <div className={`p-2.5 ${c.icon} rounded-lg`}><Icon className="w-5 h-5" /></div>
            </div>
        </div>
    );
}