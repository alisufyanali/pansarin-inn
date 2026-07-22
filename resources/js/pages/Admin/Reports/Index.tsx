import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    BarChart2, TrendingUp, Users, Package, Tag,
    CreditCard, RotateCcw, Share2, Download, RefreshCw,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports & Analytics', href: '/admin/reports' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryStats {
    total_orders: number; revenue: number; delivered: number;
    cancelled: number; new_customers: number; returns: number;
}

interface SalesRow      { period: string; orders: number; revenue: number; }
interface ProductRow    { product_id: number; product_name: string; units_sold: number; revenue: number; }
interface CustomerRow   { customer_id: number; customer_name: string; phone: string; email: string; order_count: number; total_spent: number; }
interface CategoryRow   { category_id: number; category_name: string; units_sold: number; revenue: number; orders: number; }
interface PaymentRow    { payment_method: string; order_count: number; revenue: number; }
interface ReturnsData   { total_orders: number; total_returns: number; approved_returns: number; return_rate_pct: number; by_status: Record<string,number>; }
interface AffiliateRow  { affiliate_id: number; affiliate_code: string; affiliate_name: string; affiliate_email: string; referred_orders: number; gmv: number; total_commission: number; earned_commission: number; pending_commission: number; }

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const TABS = [
    { id: 'sales',     label: 'Sales Over Time',    icon: TrendingUp },
    { id: 'products',  label: 'Top Products',        icon: Package },
    { id: 'customers', label: 'Top Customers',       icon: Users },
    { id: 'categories',label: 'Category Sales',      icon: Tag },
    { id: 'payments',  label: 'Payment Breakdown',   icon: CreditCard },
    { id: 'returns',   label: 'Returns Rate',        icon: RotateCcw },
    { id: 'affiliates',label: 'Affiliate Performance',icon: Share2 },
] as const;

type TabId = typeof TABS[number]['id'];

function pkr(n: number) { return 'PKR ' + Number(n).toLocaleString(); }
function pct(n: number) { return n.toFixed(1) + '%'; }

function SummaryCard({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className={`rounded-xl p-4 border ${color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
    );
}

function TableHeader({ cols }: { cols: string[] }) {
    return (
        <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                {cols.map(c => (
                    <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {c}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function Loading() {
    return (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return <div className="py-12 text-center text-sm text-gray-400 italic">{label}</div>;
}

/** Simple CSS bar chart — no external library */
function BarChart({ rows }: { rows: { label: string; value: number; sub?: string }[] }) {
    const max = Math.max(...rows.map(r => r.value), 1);
    return (
        <div className="space-y-2.5 mt-4">
            {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate text-right">{r.label}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center pl-2 transition-all duration-500"
                            style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }}
                        >
                            <span className="text-xs text-white font-medium truncate">{r.sub ?? r.value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface Filters { from: string; to: string; period: 'daily' | 'weekly' | 'monthly'; category_id: string; payment_method: string; }

function FilterBar({ filters, onChange, onApply }: {
    filters: Filters;
    onChange: (k: keyof Filters, v: string) => void;
    onApply: () => void;
}) {
    const cx = "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none";
    return (
        <div className="flex flex-wrap gap-3 items-end bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input type="date" value={filters.from} onChange={e => onChange('from', e.target.value)} className={cx} />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input type="date" value={filters.to} onChange={e => onChange('to', e.target.value)} className={cx} />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">Period</label>
                <select value={filters.period} onChange={e => onChange('period', e.target.value)} className={cx}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
            <button
                onClick={onApply}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
                Apply
            </button>
        </div>
    );
}

// ─── CSV download helper (client-side, no react-csv needed) ──────────────────

function downloadCsv(type: string, filters: Filters) {
    const params = new URLSearchParams({
        type, format: 'csv',
        from: filters.from, to: filters.to,
        period: filters.period,
    });
    window.open(`/admin/reports/export?${params}`, '_blank');
}

// ─── PDF export helper via jspdf-autotable ────────────────────────────────────

async function downloadPdf(title: string, head: string[][], body: (string | number)[][]) {
    const { jsPDF } = await import('jspdf');
    const autoTable  = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    autoTable(doc, { head, body: body.map(r => r.map(String)), startY: 22 });
    doc.save(title.toLowerCase().replace(/\s+/g, '-') + '.pdf');
}

// ─── ExportButtons ────────────────────────────────────────────────────────────

function ExportButtons({ onCsv, onPdf }: { onCsv: () => void; onPdf: () => void }) {
    return (
        <div className="flex gap-2 ml-auto">
            <button onClick={onCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={onPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> PDF
            </button>
        </div>
    );
}

// ─── Section: Sales Over Time ─────────────────────────────────────────────────

function SalesSection({ filters }: { filters: Filters }) {
    const [data, setData]     = useState<{ label: string; rows: SalesRow[]; totals: { orders: number; revenue: number } } | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ period: filters.period });
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            const res = await fetch(`/admin/reports/sales-over-time?${p}`);
            setData(await res.json());
        } catch { toast.error('Failed to load sales data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const head = [['Period', 'Orders', 'Revenue (PKR)']];
    const body  = (data?.rows ?? []).map(r => [r.period, r.orders, pkr(r.revenue)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Sales Over Time</h3>
                <ExportButtons
                    onCsv={() => downloadCsv('sales_over_time', filters)}
                    onPdf={() => downloadPdf('Sales Over Time', head, body)}
                />
            </div>
            {loading ? <Loading /> : !data ? <EmptyState label="No data" /> : (
                <>
                    <div className="flex gap-4 text-sm">
                        <span className="font-semibold text-indigo-600">{data.totals.orders.toLocaleString()} orders</span>
                        <span className="text-gray-400">·</span>
                        <span className="font-semibold text-emerald-600">{pkr(data.totals.revenue)}</span>
                    </div>
                    <BarChart rows={data.rows.map(r => ({ label: r.period, value: r.revenue, sub: pkr(r.revenue) }))} />
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <TableHeader cols={['Period', 'Orders', 'Revenue (PKR)']} />
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {data.rows.map(r => (
                                    <tr key={r.period} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                        <td className="px-4 py-2.5 font-mono text-xs">{r.period}</td>
                                        <td className="px-4 py-2.5">{r.orders}</td>
                                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{pkr(r.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Section: Top Products ────────────────────────────────────────────────────

function ProductsSection({ filters }: { filters: Filters }) {
    const [rows, setRows]     = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            const res = await fetch(`/admin/reports/top-products?${p}`);
            setRows(await res.json());
        } catch { toast.error('Failed to load products data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const head = [['Product', 'Units Sold', 'Revenue (PKR)']];
    const body  = rows.map(r => [r.product_name, r.units_sold, pkr(r.revenue)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Top Products</h3>
                <ExportButtons onCsv={() => downloadCsv('top_products', filters)} onPdf={() => downloadPdf('Top Products', head, body)} />
            </div>
            {loading ? <Loading /> : rows.length === 0 ? <EmptyState label="No data" /> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <TableHeader cols={['#', 'Product', 'Units Sold', 'Revenue (PKR)']} />
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {rows.map((r, i) => (
                                <tr key={r.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                    <td className="px-4 py-2.5 text-gray-400 text-xs w-8">{i + 1}</td>
                                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{r.product_name}</td>
                                    <td className="px-4 py-2.5 text-center">{r.units_sold.toLocaleString()}</td>
                                    <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{pkr(r.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Section: Top Customers ───────────────────────────────────────────────────

function CustomersSection({ filters }: { filters: Filters }) {
    const [rows, setRows]     = useState<CustomerRow[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            setRows(await (await fetch(`/admin/reports/top-customers?${p}`)).json());
        } catch { toast.error('Failed to load customer data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const head = [['Customer', 'Phone', 'Orders', 'Total Spent (PKR)']];
    const body  = rows.map(r => [r.customer_name, r.phone, r.order_count, pkr(r.total_spent)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Top Customers</h3>
                <ExportButtons onCsv={() => downloadCsv('top_customers', filters)} onPdf={() => downloadPdf('Top Customers', head, body)} />
            </div>
            {loading ? <Loading /> : rows.length === 0 ? <EmptyState label="No data" /> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <TableHeader cols={['#', 'Customer', 'Phone', 'Orders', 'Total Spent']} />
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {rows.map((r, i) => (
                                <tr key={r.customer_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                    <td className="px-4 py-2.5 text-gray-400 text-xs w-8">{i + 1}</td>
                                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{r.customer_name}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{r.phone}</td>
                                    <td className="px-4 py-2.5 text-center">{r.order_count}</td>
                                    <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{pkr(r.total_spent)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Section: Category Sales ──────────────────────────────────────────────────

function CategoriesSection({ filters }: { filters: Filters }) {
    const [rows, setRows]     = useState<CategoryRow[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            setRows(await (await fetch(`/admin/reports/category-sales?${p}`)).json());
        } catch { toast.error('Failed to load category data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const head = [['Category', 'Orders', 'Units Sold', 'Revenue (PKR)']];
    const body  = rows.map(r => [r.category_name, r.orders, r.units_sold, pkr(r.revenue)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Category Sales</h3>
                <ExportButtons onCsv={() => downloadCsv('category_sales', filters)} onPdf={() => downloadPdf('Category Sales', head, body)} />
            </div>
            {loading ? <Loading /> : rows.length === 0 ? <EmptyState label="No data" /> : (
                <>
                    <BarChart rows={rows.map(r => ({ label: r.category_name, value: r.revenue, sub: pkr(r.revenue) }))} />
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <TableHeader cols={['Category', 'Orders', 'Units Sold', 'Revenue (PKR)']} />
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {rows.map(r => (
                                    <tr key={r.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                        <td className="px-4 py-2.5 font-medium">{r.category_name}</td>
                                        <td className="px-4 py-2.5 text-center">{r.orders}</td>
                                        <td className="px-4 py-2.5 text-center">{r.units_sold.toLocaleString()}</td>
                                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{pkr(r.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Section: Payment Breakdown ───────────────────────────────────────────────

function PaymentsSection({ filters }: { filters: Filters }) {
    const [rows, setRows]     = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            setRows(await (await fetch(`/admin/reports/payment-breakdown?${p}`)).json());
        } catch { toast.error('Failed to load payment data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const totalOrders = rows.reduce((a, r) => a + r.order_count, 0);
    const head = [['Payment Method', 'Orders', '% Share', 'Revenue (PKR)']];
    const body  = rows.map(r => [r.payment_method, r.order_count, totalOrders > 0 ? pct((r.order_count / totalOrders) * 100) : '0%', pkr(r.revenue)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Payment Breakdown</h3>
                <ExportButtons onCsv={() => downloadCsv('payment_breakdown', filters)} onPdf={() => downloadPdf('Payment Breakdown', head, body)} />
            </div>
            {loading ? <Loading /> : rows.length === 0 ? <EmptyState label="No data" /> : (
                <>
                    <BarChart rows={rows.map(r => ({ label: r.payment_method || 'unknown', value: r.order_count }))} />
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <TableHeader cols={['Payment Method', 'Orders', '% Share', 'Revenue (PKR)']} />
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {rows.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                        <td className="px-4 py-2.5 font-medium capitalize">{r.payment_method || 'unknown'}</td>
                                        <td className="px-4 py-2.5 text-center">{r.order_count}</td>
                                        <td className="px-4 py-2.5 text-center text-gray-500">{totalOrders > 0 ? pct((r.order_count / totalOrders) * 100) : '—'}</td>
                                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{pkr(r.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Section: Returns Rate ────────────────────────────────────────────────────

function ReturnsSection({ filters }: { filters: Filters }) {
    const [data, setData]     = useState<ReturnsData | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            setData(await (await fetch(`/admin/reports/returns-rate?${p}`)).json());
        } catch { toast.error('Failed to load returns data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Returns Rate</h3>
                <ExportButtons onCsv={() => downloadCsv('returns_rate', filters)} onPdf={() => {}} />
            </div>
            {loading ? <Loading /> : !data ? <EmptyState label="No data" /> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <SummaryCard title="Total Orders"     value={data.total_orders}     color="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200" />
                    <SummaryCard title="Total Returns"    value={data.total_returns}    color="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200" />
                    <SummaryCard title="Approved Returns" value={data.approved_returns} color="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-200" />
                    <SummaryCard title="Return Rate"      value={pct(data.return_rate_pct)} color="bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-700 dark:text-rose-200" />
                </div>
            )}
        </div>
    );
}

// ─── Section: Affiliate Performance ──────────────────────────────────────────

function AffiliatesSection({ filters }: { filters: Filters }) {
    const [rows, setRows]     = useState<AffiliateRow[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.from) p.set('from', filters.from);
            if (filters.to)   p.set('to',   filters.to);
            setRows(await (await fetch(`/admin/reports/affiliate-performance?${p}`)).json());
        } catch { toast.error('Failed to load affiliate data.'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const head = [['Affiliate', 'Code', 'Orders', 'GMV', 'Commission', 'Earned', 'Pending']];
    const body  = rows.map(r => [r.affiliate_name, r.affiliate_code, r.referred_orders, pkr(r.gmv), pkr(r.total_commission), pkr(r.earned_commission), pkr(r.pending_commission)]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Affiliate Performance</h3>
                <ExportButtons onCsv={() => downloadCsv('affiliate_performance', filters)} onPdf={() => downloadPdf('Affiliate Performance', head, body)} />
            </div>
            {loading ? <Loading /> : rows.length === 0 ? <EmptyState label="No affiliate data in this period" /> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <TableHeader cols={['Affiliate', 'Code', 'Orders', 'GMV (PKR)', 'Commission', 'Earned', 'Pending']} />
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {rows.map(r => (
                                <tr key={r.affiliate_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                    <td className="px-4 py-2.5 font-medium">{r.affiliate_name}</td>
                                    <td className="px-4 py-2.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">{r.affiliate_code}</td>
                                    <td className="px-4 py-2.5 text-center">{r.referred_orders}</td>
                                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{pkr(r.gmv)}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">{pkr(r.total_commission)}</td>
                                    <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">{pkr(r.earned_commission)}</td>
                                    <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400">{pkr(r.pending_commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const today     = new Date().toISOString().slice(0, 10);
const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function Reports({ flash }: { flash?: { success?: string; error?: string } }) {
    const [activeTab, setActiveTab] = useState<TabId>('sales');
    const [filters, setFilters]     = useState<Filters>({
        from: thirtyAgo, to: today, period: 'daily', category_id: '', payment_method: '',
    });
    const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
    const [summary, setSummary]     = useState<SummaryStats | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // Load summary stats on filter apply
    useEffect(() => {
        const p = new URLSearchParams();
        if (appliedFilters.from) p.set('from', appliedFilters.from);
        if (appliedFilters.to)   p.set('to',   appliedFilters.to);
        fetch(`/admin/reports/summary?${p}`)
            .then(r => r.json()).then(setSummary)
            .catch(() => {});
    }, [appliedFilters]);

    function handleFilterChange(k: keyof Filters, v: string) {
        setFilters(prev => ({ ...prev, [k]: v }));
    }

    function handleApply() {
        setAppliedFilters({ ...filters });
    }

    const sectionMap: Record<TabId, React.ReactNode> = {
        sales:      <SalesSection     filters={appliedFilters} />,
        products:   <ProductsSection  filters={appliedFilters} />,
        customers:  <CustomersSection filters={appliedFilters} />,
        categories: <CategoriesSection filters={appliedFilters} />,
        payments:   <PaymentsSection  filters={appliedFilters} />,
        returns:    <ReturnsSection   filters={appliedFilters} />,
        affiliates: <AffiliatesSection filters={appliedFilters} />,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Aggregate insights across orders, products, customers, and affiliates
                    </p>
                </div>

                {/* Filter bar */}
                <FilterBar filters={filters} onChange={handleFilterChange} onApply={handleApply} />

                {/* Summary cards */}
                {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <SummaryCard title="Total Orders"   value={summary.total_orders}   color="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200" />
                        <SummaryCard title="Revenue (PKR)"  value={pkr(summary.revenue)}   color="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-200" />
                        <SummaryCard title="Delivered"      value={summary.delivered}      color="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200" />
                        <SummaryCard title="Cancelled"      value={summary.cancelled}      color="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200" />
                        <SummaryCard title="New Customers"  value={summary.new_customers}  color="bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-200" />
                        <SummaryCard title="Returns Filed"  value={summary.returns}        color="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200" />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-0">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 min-h-[300px]">
                    {sectionMap[activeTab]}
                </div>
            </div>
        </AppLayout>
    );
}
