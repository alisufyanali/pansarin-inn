import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// 1. Controller ke 'through' logic ke mutabiq interface
interface ReferralLog {
    id: number;
    affiliate_name: string;
    order_number: string;
    order_amount: string; // number_format ki wajah se string aayega
    commission_amount: string;
    commission_percentage: string;
    status: string;
    date: string;
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
            <Head title="Global Referral Logs" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 uppercase tracking-tight">
                    Global Referral Logs
                </h1>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700">Date</th>
                                    <th className="p-4 font-semibold text-gray-700">Affiliate</th>
                                    <th className="p-4 font-semibold text-gray-700">Order #</th>
                                    <th className="p-4 font-semibold text-gray-700">Sale Amount</th>
                                    <th className="p-4 font-semibold text-gray-700">Commission</th>
                                    <th className="p-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs && logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm text-gray-500">{log.date}</td>
                                            <td className="p-4 font-medium text-gray-900">{log.affiliate_name}</td>
                                            <td className="p-4 font-mono text-sm text-blue-600 font-bold">#{log.order_number}</td>
                                            <td className="p-4 text-gray-600 font-medium">Rs. {log.order_amount}</td>
                                            <td className="p-4">
                                                <div className="text-green-600 font-black text-sm">Rs. {log.commission_amount}</div>
                                                <div className="text-[10px] text-gray-400 italic">Rate: {log.commission_percentage}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    log.status === 'earned' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                                            No referral logs found.
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