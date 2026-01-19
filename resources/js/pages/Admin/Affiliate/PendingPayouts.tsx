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
            router.post(
                route('admin.affiliate.payout.approve', { id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => alert('Payout successful marked as paid!'),
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payout Requests" />

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* StatCard components */}
            </div>

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold text-gray-800">
                    Pending Payout Requests
                </h1>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <table className="w-full border-collapse text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Affiliate
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Amount
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Method
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Details
                                </th>
                                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-200">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {payouts && payouts.length > 0 ? (
                                payouts.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {p.affiliate.user.first_name}{' '}
                                            {p.affiliate.user.last_name}
                                        </td>

                                        <td className="p-4">
                                            <span className="font-bold text-red-600">
                                                Rs. {p.amount.toLocaleString()}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                {p.payment_method}
                                            </span>
                                        </td>

                                        <td className="max-w-xs truncate p-4 text-sm text-gray-600 dark:text-gray-400">
                                            {p.payment_details}
                                        </td>

                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => approve(p.id)}
                                                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                                            >
                                                Mark as Paid
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-12 text-center text-gray-500"
                                    >
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
