import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';

// 1. Referral Interface define karna
interface Referral {
    id: number;
    order_amount: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
    created_at: string;
    order?: {
        order_number: string;
    };
}

interface Props {
    referrals: Referral[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Referral Sales',
        href: '/affiliate/referrals',
    },
];

export default function Referrals({ referrals }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Your Referral Sales" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Your Referral Sales</h1>
                    <p className="text-sm text-gray-500">The orders list where you earns commission.</p>
                </div>

                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-lg font-semibold">Sales History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Order #</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Sale Amount</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Commission</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {referrals.length > 0 ? (
                                        referrals.map((ref) => (
                                            <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-mono text-sm text-blue-600 font-medium">
                                                    #{ref.order?.order_number || 'N/A'}
                                                </td>
                                                <td className="p-4 text-sm text-gray-700 font-medium">
                                                    Rs. {Number(ref.order_amount).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-bold text-green-600">
                                                        Rs. {Number(ref.commission_amount).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
<span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${ ref.status === 'approved' || ref.status === 'completed' ? 'bg-green-100 text-green-700' : ref.status === 'cancelled' || ref.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'  }`}>
        {ref.status}
</span>

                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(ref.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400">
                                                No referral sale recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}