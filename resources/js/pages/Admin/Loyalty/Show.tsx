import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Minus, X, Coins, TrendingUp, ArrowDownCircle, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Loyalty Points', href: '/admin/loyalty' },
    { title: 'Customer Ledger', href: '#' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
}

interface Transaction {
    id: number;
    points: number;
    type: 'earned' | 'redeemed' | 'admin_adjustment';
    reason: string;
    reference: string | null;
    created_at: string;
}

interface Meta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    earned:           { label: 'Earned',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20',  icon: <TrendingUp className="w-3.5 h-3.5" /> },
    redeemed:         { label: 'Redeemed',    color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-900/20',        icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
    admin_adjustment: { label: 'Adjustment',  color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20',        icon: <Wrench className="w-3.5 h-3.5" /> },
};

// ─── Adjustment Modal ─────────────────────────────────────────────────────────

function AdjustmentModal({
    customerId,
    onClose,
}: {
    customerId: number;
    onClose: () => void;
}) {
    const [points,    setPoints]    = useState<string>('');
    const [direction, setDirection] = useState<'add' | 'deduct'>('add');
    const [reason,    setReason]    = useState('');
    const [reference, setReference] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const cx = {
        input: "w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm",
        label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5",
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const absPoints = parseInt(points, 10);
        if (!absPoints || absPoints <= 0) { toast.error('Enter a valid points amount.'); return; }
        if (!reason.trim())               { toast.error('Reason is required.');          return; }

        const signed = direction === 'deduct' ? -absPoints : absPoints;

        setSubmitting(true);
        router.post(
            `/admin/loyalty/${customerId}/adjust`,
            { points: signed, reason: reason.trim(), reference: reference.trim() || null },
            {
                onSuccess: () => { toast.success('Points adjusted successfully.'); onClose(); },
                onError:   () => { toast.error('Failed to adjust points.'); setSubmitting(false); },
                onFinish:  () => setSubmitting(false),
            }
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Points Adjustment</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Add / Deduct toggle */}
                    <div>
                        <label className={cx.label}>Action</label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                            <button
                                type="button"
                                onClick={() => setDirection('add')}
                                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                                    direction === 'add'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Plus className="w-4 h-4" /> Add Points
                            </button>
                            <button
                                type="button"
                                onClick={() => setDirection('deduct')}
                                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors border-l border-gray-300 dark:border-gray-600 ${
                                    direction === 'deduct'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Minus className="w-4 h-4" /> Deduct Points
                            </button>
                        </div>
                    </div>

                    {/* Points amount */}
                    <div>
                        <label className={cx.label}>
                            Points <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="e.g. 100"
                            className={cx.input}
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className={cx.label}>
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Complaint resolution, Birthday bonus"
                            className={cx.input}
                            maxLength={255}
                        />
                    </div>

                    {/* Reference */}
                    <div>
                        <label className={cx.label}>
                            Reference <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g. Ticket #123 or ORDER-50001"
                            className={cx.input}
                            maxLength={255}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 ${
                                direction === 'add'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                        >
                            {submitting ? 'Saving...' : (direction === 'add' ? 'Add Points' : 'Deduct Points')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Show({
    customer,
    balance,
    transactions: initialTransactions,
    meta: initialMeta,
    flash,
}: {
    customer: Customer;
    balance: number;
    transactions: Transaction[];
    meta: Meta;
    flash?: { success?: string; error?: string };
}) {
    const [showModal,     setShowModal]     = useState(false);
    const [transactions,  setTransactions]  = useState<Transaction[]>(initialTransactions);
    const [meta,          setMeta]          = useState<Meta>(initialMeta);
    const [currentBalance, setCurrentBalance] = useState(balance);
    const [loadingPage,   setLoadingPage]   = useState(false);
    const [filterType,    setFilterType]    = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // Re-load history when returning from a successful adjustment
    useEffect(() => {
        setTransactions(initialTransactions);
        setMeta(initialMeta);
        setCurrentBalance(balance);
    }, [initialTransactions, initialMeta, balance]);

    async function loadPage(page: number, type: string = filterType) {
        setLoadingPage(true);
        try {
            const params = new URLSearchParams({ per_page: '20', page: String(page) });
            if (type) params.set('type', type);

            const res  = await fetch(`/admin/loyalty/${customer.id}/history?${params}`);
            const data = await res.json();

            setTransactions(data.transactions);
            setMeta(data.meta);
            setCurrentBalance(data.balance);
        } catch {
            toast.error('Failed to load history.');
        } finally {
            setLoadingPage(false);
        }
    }

    function handleFilterChange(type: string) {
        setFilterType(type);
        loadPage(1, type);
    }

    const earned   = transactions.filter(t => t.type === 'earned').length;
    const redeemed = transactions.filter(t => t.type === 'redeemed').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Loyalty — ${customer.first_name} ${customer.last_name}`} />

            {showModal && (
                <AdjustmentModal
                    customerId={customer.id}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="p-4 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/loyalty"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {customer.phone} {customer.email ? `· ${customer.email}` : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm"
                    >
                        <Wrench className="w-4 h-4" />
                        Adjust Points
                    </button>
                </div>

                {/* Balance card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Coins className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Current Balance</span>
                    </div>
                    <div className="text-5xl font-bold tracking-tight">
                        {currentBalance.toLocaleString()}
                        <span className="text-2xl font-normal opacity-70 ml-2">pts</span>
                    </div>
                    <p className="text-sm opacity-60 mt-2">
                        Equivalent to PKR {(currentBalance * 1).toLocaleString()} in store credit (if redemption enabled)
                    </p>
                </div>

                {/* Transaction ledger */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Table toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                            Transaction History
                            {meta.total > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500">({meta.total} total)</span>
                            )}
                        </h3>
                        {/* Type filter */}
                        <div className="flex gap-2 flex-wrap">
                            {(['', 'earned', 'redeemed', 'admin_adjustment'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange(type)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                        filterType === type
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {type === '' ? 'All' : type === 'admin_adjustment' ? 'Adjustments' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className={`overflow-x-auto transition-opacity ${loadingPage ? 'opacity-50' : 'opacity-100'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400 italic text-sm">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : transactions.map((t) => {
                                    const cfg = TYPE_CONFIG[t.type] ?? TYPE_CONFIG.earned;
                                    return (
                                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                {new Date(t.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                                    {cfg.icon}{cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 text-sm">
                                                {t.reason}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs font-mono">
                                                {t.reference ?? <span className="italic text-gray-400">—</span>}
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-bold text-base ${t.points >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {t.points >= 0 ? '+' : ''}{t.points.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={meta.current_page <= 1 || loadingPage}
                                    onClick={() => loadPage(meta.current_page - 1)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    ← Prev
                                </button>
                                <button
                                    disabled={meta.current_page >= meta.last_page || loadingPage}
                                    onClick={() => loadPage(meta.current_page + 1)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
