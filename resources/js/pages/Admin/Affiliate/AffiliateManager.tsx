import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

// 1. Affiliate Interface for TypeScript
interface Affiliate {
    id: number;
    affiliate_code: string;
    balance: number;
    commission_rate: number;
    status: boolean;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface Props {
    affiliates: Affiliate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Affiliate Dashboard',
        href: '/admin/affiliates',
    },
];

export default function Dashboard({ affiliates }: Props) {
    // 2. Fixed Toggle Status Function
    const toggleStatus = (id: number) => {
        // 'id' ko object { id } mein pass karne se red line hat jayegi
        router.patch(
            route('admin.affiliate.updateStatus', { id }),
            {},
            {
                preserveScroll: true, // Status change hone par page jump nahi karega
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Management" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Affiliate Management</h1>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <table className="w-full border-collapse text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Name
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Code
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Balance
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Rate (%)
                                </th>
                                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                                    Status
                                </th>
                                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-200">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {affiliates && affiliates.length > 0 ? (
                                affiliates.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {item.user.first_name}{' '}
                                                {item.user.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.user.email}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                {item.affiliate_code}
                                            </code>
                                        </td>

                                        <td className="p-4 font-bold text-emerald-600">
                                            Rs. {item.balance.toLocaleString()}
                                        </td>

                                        <td className="p-4">
                                            {item.commission_rate}%
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    item.status
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                                }`}
                                            >
                                                {item.status
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() =>
                                                    toggleStatus(item.id)
                                                }
                                                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all ${
                                                    item.status
                                                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                }`}
                                            >
                                                {item.status
                                                    ? 'Deactivate'
                                                    : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-12 text-center text-gray-500"
                                    >
                                        No affiliates found in the database.
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
