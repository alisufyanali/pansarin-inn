import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart, DollarSign, Clock, AlertTriangle,
    RotateCcw, UserPlus, Star, TrendingUp,
    Package, ArrowRight,
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
    today_orders: number;
    today_revenue: number;
    mtd_revenue: number;
    pending_orders: number;
    low_stock_count: number;
    pending_returns: number;
    new_customers_today: number;
    top_product: { id: number; name: string; units_sold: number; revenue: number } | null;
}

interface TrendPoint { day: string; revenue: number; orders: number; }

interface ActivityItem {
    type: 'order' | 'return';
    id: number;
    label: string;
    status: string;
    amount?: number;
    reason?: string;
    customer_name: string;
    customer_phone?: string;
    created_at: string;
    url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pkr(n: number) { return 'PKR ' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    color: string;       // Tailwind bg colour for icon bg
    textColor: string;   // Tailwind text colour
    href?: string;
    alert?: boolean;
}

function KpiCard({ title, value, sub, icon, color, textColor, href, alert }: KpiCardProps) {
    const content = (
        <div className={`relative bg-white dark:bg-gray-800 rounded-2xl border ${alert ? 'border-amber-400 dark:border-amber-500' : 'border-gray-200 dark:border-gray-700'} p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`${color} p-3 rounded-xl shrink-0`}>
                <div className={textColor}>{icon}</div>
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
            </div>
            {href && <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 absolute top-4 right-4" />}
        </div>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Revenue Bar Chart (last 30 days) ─────────────────────────────────────────

function RevenueTrendChart({ trend }: { trend: TrendPoint[] }) {
    const max = Math.max(...trend.map(t => t.revenue), 1);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Revenue — Last 30 Days</h3>
            </div>
            <div className="flex items-end gap-0.5 h-32">
                {trend.map((t) => (
                    <div
                        key={t.day}
                        title={`${t.day}\n${pkr(t.revenue)}\n${t.orders} orders`}
                        className="flex-1 bg-indigo-500 dark:bg-indigo-600 rounded-t hover:bg-indigo-400 transition-colors cursor-default"
                        style={{ height: `${Math.max((t.revenue / max) * 100, t.revenue > 0 ? 4 : 1)}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{trend[0]?.day?.slice(5)}</span>
                <span>{trend[trend.length - 1]?.day?.slice(5)}</span>
            </div>
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const ORDER_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    refunded:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const RETURN_COLORS: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    approved:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    rejected:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

function Badge({ label, color }: { label: string; color: string }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label.charAt(0).toUpperCase() + label.slice(1)}
        </span>
    );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ items }: { items: ActivityItem[] }) {
    if (items.length === 0) {
        return <p className="text-sm text-gray-400 italic py-6 text-center">No recent activity</p>;
    }

    return (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((item, i) => (
                <li key={`${item.type}-${item.id}-${i}`}>
                    <Link
                        href={item.url}
                        className="flex items-start gap-3 px-1 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors group"
                    >
                        {/* Icon */}
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${item.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                            {item.type === 'order'
                                ? <ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                : <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {item.label}
                                </span>
                                <Badge
                                    label={item.status}
                                    color={item.type === 'order' ? (ORDER_COLORS[item.status] ?? ORDER_COLORS.pending) : (RETURN_COLORS[item.status] ?? RETURN_COLORS.pending)}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <span>{item.customer_name}</span>
                                {item.customer_phone && <span>· {item.customer_phone}</span>}
                                {item.amount !== undefined && <span className="font-medium text-emerald-600 dark:text-emerald-400">· {pkr(item.amount)}</span>}
                                {item.reason && <span>· {item.reason.replace('_', ' ')}</span>}
                            </div>
                        </div>

                        {/* Time */}
                        <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{timeAgo(item.created_at)}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
    kpis: Kpis;
    trend: TrendPoint[];
    activity: ActivityItem[];
    flash?: { success?: string; error?: string };
}

export default function Dashboard({ kpis, trend, activity }: Props) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const hasKpis = kpis && Object.keys(kpis).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Page title */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {hasKpis ? (
                    <>
                        {/* KPI Cards — 4 columns on large, 2 on medium, 1 on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard
                                title="Today's Orders"
                                value={kpis.today_orders}
                                sub={`Revenue: ${pkr(kpis.today_revenue)}`}
                                icon={<ShoppingCart className="w-5 h-5" />}
                                color="bg-blue-100 dark:bg-blue-900/30"
                                textColor="text-blue-600 dark:text-blue-400"
                                href="/admin/orders"
                            />
                            <KpiCard
                                title="Month-to-Date Revenue"
                                value={pkr(kpis.mtd_revenue)}
                                sub="Excluding cancelled/refunded"
                                icon={<DollarSign className="w-5 h-5" />}
                                color="bg-emerald-100 dark:bg-emerald-900/30"
                                textColor="text-emerald-600 dark:text-emerald-400"
                                href="/admin/reports"
                            />
                            <KpiCard
                                title="Pending Orders"
                                value={kpis.pending_orders}
                                sub="Awaiting processing"
                                icon={<Clock className="w-5 h-5" />}
                                color="bg-amber-100 dark:bg-amber-900/30"
                                textColor="text-amber-600 dark:text-amber-400"
                                href="/admin/orders"
                                alert={kpis.pending_orders > 10}
                            />
                            <KpiCard
                                title="Low Stock Alerts"
                                value={kpis.low_stock_count}
                                sub="Products/variants ≤ 10 units"
                                icon={<AlertTriangle className="w-5 h-5" />}
                                color="bg-rose-100 dark:bg-rose-900/30"
                                textColor="text-rose-600 dark:text-rose-400"
                                href="/admin/inventory"
                                alert={kpis.low_stock_count > 0}
                            />
                            <KpiCard
                                title="Pending Returns"
                                value={kpis.pending_returns}
                                sub="Awaiting review"
                                icon={<RotateCcw className="w-5 h-5" />}
                                color="bg-orange-100 dark:bg-orange-900/30"
                                textColor="text-orange-600 dark:text-orange-400"
                                href="/admin/returns"
                                alert={kpis.pending_returns > 0}
                            />
                            <KpiCard
                                title="New Customers Today"
                                value={kpis.new_customers_today}
                                sub="Registered today"
                                icon={<UserPlus className="w-5 h-5" />}
                                color="bg-purple-100 dark:bg-purple-900/30"
                                textColor="text-purple-600 dark:text-purple-400"
                                href="/admin/customers"
                            />
                            {kpis.top_product && (
                                <div className="sm:col-span-2">
                                    <KpiCard
                                        title="Top Product (7 Days)"
                                        value={kpis.top_product.name}
                                        sub={`${kpis.top_product.units_sold} units · ${pkr(kpis.top_product.revenue)}`}
                                        icon={<Star className="w-5 h-5" />}
                                        color="bg-indigo-100 dark:bg-indigo-900/30"
                                        textColor="text-indigo-600 dark:text-indigo-400"
                                        href={`/admin/products/${kpis.top_product.id}`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Revenue Trend + Activity Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            {/* Chart — 3 cols */}
                            <div className="lg:col-span-3">
                                {trend.length > 0 ? (
                                    <RevenueTrendChart trend={trend} />
                                ) : (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full flex items-center justify-center text-sm text-gray-400 italic">
                                        No revenue data for the last 30 days
                                    </div>
                                )}
                            </div>

                            {/* Activity Feed — 2 cols */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-gray-500" />
                                        <h3 className="font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                                    </div>
                                    <Link href="/admin/orders" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
                                </div>
                                <ActivityFeed items={activity} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center py-24 text-gray-400 italic text-sm">
                        Dashboard data unavailable. Check server logs.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
