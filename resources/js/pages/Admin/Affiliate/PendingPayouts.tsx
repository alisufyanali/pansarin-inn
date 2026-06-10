import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Payout {
    id: number;
    amount: number;
    status: string;
    payment_method_snapshot?: string; 
    payment_details_snapshot?: string | any; 
    created_at_formatted?: string; 
    affiliate?: {
        id: number;
        user?: {
            name: string;
            email: string;
        };
    };
}

interface Props {
    payouts: Payout[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pending Payouts',
        href: '/admin/affiliates/payouts-list',
    },
];

export default function PendingPayouts({ payouts = [] }: Props) {
    
    const approve = (id: number) => {
        if (confirm('Have you transferred the funds to this affiliates account?')) {
            router.post(
                route('admin.affiliate.payout.approve', { id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => alert('Payout marked as successfully paid!'),
                }
            );
        }
    };

    const reject = (id: number) => {
    const reason = prompt('Please enter the reason for rejecting this payout:');
    
    if (reason === null) return;
    
    if (!reason.trim()) {
        alert('Providing a reason is required.');
        return;
    }

    router.post(
        route('admin.affiliate.payout.reject', { id }),
        { admin_note: reason },
        {
            preserveScroll: true,
            onSuccess: () => alert('The payout request has been rejected successfully.'),
        }
    );
};

    const renderPaymentDetails = (payout: Payout) => {
        if (!payout.payment_details_snapshot) return <span>No Details Available</span>;
        try {
            const details = typeof payout.payment_details_snapshot === 'string' 
                ? JSON.parse(payout.payment_details_snapshot) 
                : payout.payment_details_snapshot;

            return (
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Title:</span> {details?.account_name || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Acc #:</span> {details?.account_number || 'N/A'}</p>
                    {details?.iban_number && (
                        <p><span className="font-semibold text-gray-800 dark:text-gray-200">IBAN:</span> {details.iban_number}</p>
                    )}
                </div>
            );
        } catch (e) {
            return <span className="text-xs text-gray-500">{payout.payment_method_snapshot || 'N/A'}</span>;
        }
    };

    // Gateway string ko safely handle karne ke liye helper
    const getGatewayName = (snapshot?: string) => {
        if (!snapshot) return 'Unknown';
        return snapshot.includes('—') ? snapshot.split('—')[0].trim() : snapshot;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Payout Requests" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Pending Payout Requests
                    </h1>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <table className="w-full border-collapse text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Affiliate</th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Payment Gateway</th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Account Details</th>
                                <th className="p-4 text-center font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {payouts && payouts.length > 0 ? (
                                payouts.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
    <div className="font-semibold">
        {/* first_name + last_name ki jagah sirf single name field call karein */}
        {p.affiliate?.user?.name || 'Unknown User'}
    </div>
    <div className="text-xs font-normal text-gray-400">{p.affiliate?.user?.email || ''}</div>
    <div className="mt-1 text-[10px] font-normal text-gray-400">{p.created_at_formatted || ''}</div>
</td>

                                        <td className="p-4">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                Rs. {p.amount?.toLocaleString()}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                {getGatewayName(p.payment_method_snapshot)}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            {renderPaymentDetails(p)}
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => approve(p.id)}
                                                    className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
                                                >
                                                    Mark as Paid
                                                </button>
                                                <button
                                                    onClick={() => reject(p.id)}
                                                    className="inline-flex items-center rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        No pending payout requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}