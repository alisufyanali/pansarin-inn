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
        router.patch(route('admin.affiliate.updateStatus', { id }), {}, {
            preserveScroll: true, // Status change hone par page jump nahi karega
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Management" />
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Affiliate Management</h1>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700">Name</th>
                                <th className="p-4 font-semibold text-gray-700">Code</th>
                                <th className="p-4 font-semibold text-gray-700">Balance</th>
                                <th className="p-4 font-semibold text-gray-700">Rate (%)</th>
                                <th className="p-4 font-semibold text-gray-700">Status</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {affiliates && affiliates.length > 0 ? (
                                affiliates.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">
                                                {item.user.first_name} {item.user.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">{item.user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                {item.affiliate_code}
                                            </code>
                                        </td>
                                        <td className="p-4 text-green-600 font-bold">
                                            Rs. {item.balance.toLocaleString()}
                                        </td>
                                        <td className="p-4">{item.commission_rate}%</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.status 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => toggleStatus(item.id)}
                                                className={`text-sm font-semibold px-3 py-1 rounded border transition-colors ${
                                                    item.status 
                                                    ? 'text-red-600 border-red-200 hover:bg-red-50' 
                                                    : 'text-green-600 border-green-200 hover:bg-green-50'
                                                }`}
                                            >
                                                {item.status ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
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