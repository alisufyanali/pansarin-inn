import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, PackageCheck, User, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns',     href: '/admin/returns' },
    { title: 'View Return', href: '#' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReturnItem {
    id: number;
    quantity: number;
    item_reason: string | null;
    product_name: string;
    variant_name: string | null;
    sku: string;
    original_qty: number;
    unit_price: number;
}

interface ReturnDetail {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    reason_category: string;
    comment: string | null;
    refund_amount: number | null;
    admin_note: string | null;
    reviewed_at: string | null;
    created_at: string;
    reviewer: { id: number; name: string } | null;
    order: { id: number; order_number: string; grand_total: number; status: string } | null;
    customer: { id: number | null; first_name: string; last_name: string; phone: string; address: string | null };
    items: ReturnItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    rejected:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const REASON_LABELS: Record<string, string> = {
    defective:  'Defective / Damaged',
    wrong_item: 'Wrong Item Received',
    not_needed: 'No Longer Needed',
    other:      'Other',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="text-gray-500 dark:text-gray-400">{icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 mr-4">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 text-right">{children}</span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Show({ returnRequest, flash }: { returnRequest: ReturnDetail; flash?: { success?: string; error?: string } }) {
    const [adminNote, setAdminNote]       = useState(returnRequest.admin_note ?? '');
    const [refundAmount, setRefundAmount] = useState<string>(returnRequest.refund_amount?.toString() ?? '');
    const [submitting, setSubmitting]     = useState<string | null>(null);

    function handleStatusChange(status: 'approved' | 'rejected' | 'completed') {
        if (status === 'completed' && !refundAmount) {
            toast.error('Please enter a refund amount before marking as refunded.');
            return;
        }

        if (!confirm(`Are you sure you want to mark this return as "${status}"?`)) return;

        setSubmitting(status);

        router.post(
            `/admin/returns/${returnRequest.id}/status`,
            { status, admin_note: adminNote, refund_amount: refundAmount || null },
            {
                onSuccess: () => toast.success('Status updated successfully.'),
                onError:   () => toast.error('Failed to update status.'),
                onFinish:  () => setSubmitting(null),
            }
        );
    }

    const isPending  = returnRequest.status === 'pending';
    const isApproved = returnRequest.status === 'approved';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Return #${returnRequest.id}`} />

            <div className="p-4 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/returns"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Return Request #{returnRequest.id}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Submitted {new Date(returnRequest.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[returnRequest.status]}`}>
                        {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                    </span>
                </div>

                {/* 3-column info grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer */}
                    <InfoCard title="Customer" icon={<User className="w-4 h-4" />}>
                        <Row label="Name">
                            {returnRequest.customer.first_name} {returnRequest.customer.last_name}
                        </Row>
                        <Row label="Phone">{returnRequest.customer.phone ?? '—'}</Row>
                        {returnRequest.customer.address && (
                            <Row label="Address">{returnRequest.customer.address}</Row>
                        )}
                    </InfoCard>

                    {/* Order */}
                    <InfoCard title="Order" icon={<ShoppingCart className="w-4 h-4" />}>
                        {returnRequest.order ? (
                            <>
                                <Row label="Order #">
                                    <Link
                                        href={`/admin/orders/${returnRequest.order.id}`}
                                        className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {returnRequest.order.order_number}
                                    </Link>
                                </Row>
                                <Row label="Order Total">
                                    PKR {Number(returnRequest.order.grand_total).toLocaleString()}
                                </Row>
                                <Row label="Order Status">
                                    <span className="capitalize">{returnRequest.order.status}</span>
                                </Row>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Order not found</p>
                        )}
                    </InfoCard>

                    {/* Return details */}
                    <InfoCard title="Return Details" icon={<Package className="w-4 h-4" />}>
                        <Row label="Reason">
                            {REASON_LABELS[returnRequest.reason_category] ?? returnRequest.reason_category}
                        </Row>
                        {returnRequest.comment && (
                            <Row label="Comment">
                                <span className="text-xs">{returnRequest.comment}</span>
                            </Row>
                        )}
                        {returnRequest.refund_amount != null && (
                            <Row label="Refund Amount">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    PKR {Number(returnRequest.refund_amount).toLocaleString()}
                                </span>
                            </Row>
                        )}
                        {returnRequest.reviewer && (
                            <Row label="Reviewed By">{returnRequest.reviewer.name}</Row>
                        )}
                        {returnRequest.reviewed_at && (
                            <Row label="Reviewed At">
                                {new Date(returnRequest.reviewed_at).toLocaleString()}
                            </Row>
                        )}
                    </InfoCard>
                </div>

                {/* Items table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                            Return Items ({returnRequest.items.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Return Qty</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Qty</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {returnRequest.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400 italic text-sm">
                                            No items recorded
                                        </td>
                                    </tr>
                                ) : returnRequest.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{item.product_name}</div>
                                            {item.variant_name && (
                                                <div className="text-xs text-gray-500 mt-0.5">{item.variant_name}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-rose-600 dark:text-rose-400">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500">{item.original_qty}</td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                            PKR {Number(item.unit_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                            {item.item_reason ?? <span className="italic text-gray-400">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admin Action Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Admin Action</h3>

                    {/* Admin note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Admin Note <span className="text-gray-400 font-normal">(optional — visible to staff only)</span>
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder="Add internal notes about this return decision..."
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm resize-none"
                        />
                    </div>

                    {/* Refund amount — shown when approved or marking as completed */}
                    {(isApproved || isPending) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Refund Amount <span className="text-gray-400 font-normal">(required to mark as Refunded)</span>
                            </label>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">PKR</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action buttons — only show relevant actions per current status */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {isPending && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('approved')}
                                    disabled={submitting !== null}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {submitting === 'approved' ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleStatusChange('rejected')}
                                    disabled={submitting !== null}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                    {submitting === 'rejected' ? 'Rejecting...' : 'Reject'}
                                </button>
                            </>
                        )}

                        {isApproved && (
                            <button
                                onClick={() => handleStatusChange('completed')}
                                disabled={submitting !== null}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                            >
                                <PackageCheck className="w-4 h-4" />
                                {submitting === 'completed' ? 'Processing...' : 'Mark as Refunded'}
                            </button>
                        )}

                        {!isPending && !isApproved && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                                This return has been{' '}
                                <span className="font-medium">{returnRequest.status}</span> — no further actions available.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
