










import React from 'react';
import { Head, router } from '@inertiajs/react';

interface Affiliate {
    id: number;
    user: { first_name: string; last_name: string; email: string };
    affiliate_code: string;
    balance: number;
    commission_rate: number;
    status: number;
}

export default function AffiliateManager({ affiliates }: { affiliates: Affiliate[] }) {
    
    const toggleStatus = (id: number) => {
        // Fix: Added empty object {} as second parameter
        router.patch(route('admin.affiliate.updateStatus', id), {});
    };

    return (
        <div className="p-6">
            <Head title="Manage Affiliates" />
            <h1 className="text-2xl font-bold mb-6">Affiliate Management</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">Balance</th>
                            <th className="p-4">Rate (%)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {affiliates.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-bold">{item.user.first_name} {item.user.last_name}</div>
                                    <div className="text-sm text-gray-500">{item.user.email}</div>
                                </td>
                                <td className="p-4"><code className="bg-gray-100 px-2 py-1 rounded">{item.affiliate_code}</code></td>
                                <td className="p-4 text-green-600 font-bold">Rs. {item.balance}</td>
                                <td className="p-4">{item.commission_rate}%</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => toggleStatus(item.id)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Toggle Status
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}