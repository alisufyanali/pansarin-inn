import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Package, User, Calendar, FileText,
    TrendingUp, TrendingDown, Edit, Trash2,
    ArrowLeft, Tag, AlertTriangle, RotateCcw, Settings
} from 'lucide-react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/admin/inventory' },
    { title: 'View Entry', href: '#' },
];

interface Inventory {
    id: number;
    product_id: number;
    product_variant_id: number | null;
    quantity: number;
    type: 'in' | 'out' | 'adjustment' | 'return';
    cost_price: number | null;
    reference: string | null;
    source: string | null;
    note: string | null;
    current_stock: number;
    product: {
        id: number;
        name: string;
        sku: string;
        unit?: string;
        category?: { id: number; name: string };
    };
    variant?: {
        id: number;
        sku: string;
        value: string;
        attributes: Record<string, string>;
    } | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    inventory: Inventory;
    current_stock: number;
}

const TYPE_CONFIG = {
    in:         { label: 'Stock In',    icon: TrendingUp,   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  sign: '+' },
    out:        { label: 'Stock Out',   icon: TrendingDown, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',          sign: '-' },
    adjustment: { label: 'Adjustment',  icon: Settings,     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   sign: '±' },
    return:     { label: 'Return',      icon: RotateCcw,    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       sign: '+' },
};

export default function Show({ inventory, current_stock }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this inventory entry?')) {
            router.delete(`/admin/inventory/${inventory.id}`);
        }
    };

    const typeConf   = TYPE_CONFIG[inventory.type] ?? TYPE_CONFIG.in;
    const TypeIcon   = typeConf.icon;
    const stock      = current_stock ?? 0;
    const isLow      = stock <= 10 && stock > 0;
    const isOut      = stock <= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventory Entry #${inventory.id}`} />

            <div className="p-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/inventory"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Inventory Entry #{inventory.id}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Transaction details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/inventory/${inventory.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm">
                            <Edit className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                {/* Type Badge */}
                <div className="mb-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${typeConf.color}`}>
                        <TypeIcon className="w-4 h-4" />
                        {typeConf.label} Transaction
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Product Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" /> Product Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Product Name</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {inventory.product?.name ?? '—'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Product SKU</p>
                                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {inventory.product?.sku ?? '—'}
                                    </p>
                                </div>
                                {inventory.product?.unit && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Unit</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {inventory.product.unit}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Variant */}
                            {inventory.variant && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                    <p className="text-xs text-indigo-500 mb-1">Variant</p>
                                    <p className="font-semibold text-indigo-800 dark:text-indigo-300">
                                        {Object.values(inventory.variant.attributes ?? {}).join(' / ') || inventory.variant.value}
                                    </p>
                                    <p className="text-xs text-indigo-500 font-mono mt-0.5">SKU: {inventory.variant.sku}</p>
                                </div>
                            )}

                            {inventory.product?.category && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Category</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {inventory.product.category.name}
                                    </p>
                                </div>
                            )}

                            {/* Current Stock */}
                            <div className={`p-4 rounded-lg border ${
                                isOut ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                                isLow ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                                        'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            }`}>
                                <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                                <p className={`text-2xl font-bold ${
                                    isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                    {stock} {inventory.product?.unit || 'units'}
                                </p>
                                {(isLow || isOut) && (
                                    <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${isOut ? 'text-red-600' : 'text-yellow-600'}`}>
                                        <AlertTriangle className="w-3 h-3" />
                                        {isOut ? 'Out of Stock!' : 'Low Stock Warning!'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Transaction Details
                        </h2>
                        <div className="space-y-4">

                            {/* Quantity */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                <p className={`text-4xl font-bold ${typeConf.color.split(' ')[1]}`}>
                                    {typeConf.sign}{Math.abs(inventory.quantity)}
                                    {inventory.product?.unit && (
                                        <span className="text-base font-normal text-gray-400 ml-2">{inventory.product.unit}</span>
                                    )}
                                </p>
                            </div>

                            {/* Cost Price */}
                            {inventory.cost_price != null && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Cost Price (per unit)</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        Rs. {Number(inventory.cost_price).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Source */}
                            {inventory.source && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Source</p>
                                    <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium capitalize">
                                        {inventory.source}
                                    </span>
                                </div>
                            )}

                            {/* Reference */}
                            {inventory.reference && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Reference
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-sm">
                                        {inventory.reference}
                                    </p>
                                </div>
                            )}

                            {/* Note */}
                            {inventory.note && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Note</p>
                                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                                        {inventory.note}
                                    </p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-xs">Created</span>
                                    </div>
                                    <p className="text-xs text-gray-900 dark:text-gray-100">
                                        {new Date(inventory.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-xs">Updated</span>
                                    </div>
                                    <p className="text-xs text-gray-900 dark:text-gray-100">
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