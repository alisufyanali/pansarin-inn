import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

// 1. Payout Interface define karna
interface Payout {
    id: number;
    amount: number;
    payment_method: string;
    payment_details: string;
    affiliate: {
        user: {
            first_name: string;
            last_name: string;
        };
    };
}

interface Props {
    payouts: Payout[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payout Requests',
        href: '/admin/payouts',
    },
];

export default function PendingPayouts({ payouts }: Props) {
    
    // 2. Approve Function with Fix
    const approve = (id: number) => {
        if (confirm('Kya aapne paise transfer kar diye hain?')) {
            // Fix: 'id' ko object { id } mein pass kiya aur empty data object {} shamil kiya
            router.post(route('admin.affiliate.payout.approve', { id }), {}, {
                preserveScroll: true,
                onSuccess: () => alert('Payout successful marked as paid!'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payout Requests" />
            
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Pending Payout Requests</h1>
                
                <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700">Affiliate</th>
                                <th className="p-4 font-semibold text-gray-700">Amount</th>
                                <th className="p-4 font-semibold text-gray-700">Method</th>
                                <th className="p-4 font-semibold text-gray-700">Details</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts && payouts.length > 0 ? (
                                payouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">
                                            {p.affiliate.user.first_name} {p.affiliate.user.last_name}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-red-600">
                                                Rs. {p.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="capitalize px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                                {p.payment_method}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                            {p.payment_details}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => approve(p.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-shadow shadow-sm hover:shadow-md"
                                            >
                                                Mark as Paid
                                            </button>
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