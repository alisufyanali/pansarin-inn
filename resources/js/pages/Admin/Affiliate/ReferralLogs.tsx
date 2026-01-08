import React from 'react';

export default function ReferralLogs({ logs }: { logs: any[] }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Global Referral Logs</h1>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-4">Order #</th>
                            <th className="p-4">Affiliate</th>
                            <th className="p-4">Sale Amount</th>
                            <th className="p-4">Commission</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-b">
                                <td className="p-4 font-mono">{log.order.order_number}</td>
                                <td className="p-4">{log.affiliate.user.first_name}</td>
                                <td className="p-4">Rs. {log.order_amount}</td>
                                <td className="p-4 text-green-600 font-bold">Rs. {log.commission_amount}</td>
                                <td className="p-4 uppercase text-xs">{log.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}