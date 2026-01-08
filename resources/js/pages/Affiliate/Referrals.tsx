import React from 'react';

export default function Referrals({ referrals }: { referrals: any[] }) {
    return (
        <div className="p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Your Referral Sales</h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 border">Order #</th>
                        <th className="p-3 border">Amount</th>
                        <th className="p-3 border">Commission</th>
                        <th className="p-3 border">Status</th>
                        <th className="p-3 border">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {referrals.map((ref) => (
                        <tr key={ref.id}>
                            <td className="p-3 border">{ref.order?.order_number}</td>
                            <td className="p-3 border">Rs. {ref.order_amount}</td>
                            <td className="p-3 border text-green-600 font-bold">Rs. {ref.commission_amount}</td>
                            <td className="p-3 border">
                                <span className={`px-2 py-1 rounded text-xs ${ref.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {ref.status}
                                </span>
                            </td>
                            <td className="p-3 border">{new Date(ref.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}