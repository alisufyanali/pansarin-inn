import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// 1. Referral Log ki Type define karna
interface ReferralLog {
    id: number;
    order_amount: number;
    commission_amount: number;
    status: string;
    order: {
        order_number: string;
    };
    affiliate: {
        user: {
            first_name: string;
            last_name: string;
        };
    };
}

interface Props {
    logs: ReferralLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Referral Logs',
        href: '/admin/referral-logs',
    },
];

export default function ReferralLogs({ logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Referral Logs" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Global Referral Logs</h1>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Order #</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Affiliate</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Sale Amount</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Commission</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs && logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-mono text-sm text-blue-600 font-medium">
                                                #{log.order.order_number}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">
                                                    {log.affiliate.user.first_name} {log.affiliate.user.last_name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                Rs. {Number(log.order_amount).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-green-600 font-bold">
                                                Rs. {Number(log.commission_amount).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                    log.status === 'completed' || log.status === 'paid'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            No referral logs recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}