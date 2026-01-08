import React from 'react';
import { router } from '@inertiajs/react';

export default function PendingPayouts({ payouts }: { payouts: any[] }) {
    
    const approve = (id: number) => {
        if(confirm('Kya aapne paise transfer kar diye hain?')) {
            // Fix: Dusre parameter mein khali object {} dena lazmi hai
            router.post(route('admin.affiliate.payout.approve', id), {});
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Payout Requests</h1>
            <div className="bg-white shadow rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Affiliate</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((p) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-4">{p.affiliate.user.first_name}</td>
                                <td className="p-4 font-bold text-red-600">Rs. {p.amount}</td>
                                <td className="p-4">{p.payment_method}</td>
                                <td className="p-4 text-sm">{p.payment_details}</td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => approve(p.id)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Mark as Paid
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