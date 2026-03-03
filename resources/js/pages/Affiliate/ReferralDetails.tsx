import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag, DollarSign, Calendar } from 'lucide-react';

interface Props {
    customer: { name: string; email: string; joined: string };
    orders: any[];
    stats: { total_spent: string; total_earned: string };
}

export default function ReferralDetails({ customer, orders, stats }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/affiliate/dashboard' },
            { title: 'Referral Details', href: '#' }
        ]}>
            <Head title={`Details - ${customer.name}`} />

            <div className="max-w-5xl mx-auto py-10 space-y-8">
                {/* Header & Back Button */}
                <div className="flex items-center justify-between">
                    <Link href="/affiliate/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </Link>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-10">
                    <div className="flex-1">
                        <h1 className="text-3xl font-black dark:text-white">{customer.name}</h1>
                        <p className="text-gray-500">{customer.email}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={16} /> Joined on {customer.joined}
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Orders Value</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">Rs. {stats.total_spent}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-green-500 uppercase">Your Total Profit</p>
                            <p className="text-2xl font-black text-green-600">Rs. {stats.total_earned}</p>
                        </div>
                    </div>
                </div>

                {/* Orders History Table */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-800 font-bold text-lg dark:text-white">
                        Order History
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Order Amount</th>
                                    <th className="px-8 py-4">Commission</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {orders.map((order) => (
                                    <tr key={order.id} className="text-sm">
                                        <td className="px-8 py-5 dark:text-gray-300">{order.date}</td>
                                        <td className="px-8 py-5 font-bold dark:text-white">Rs. {order.amount}</td>
                                        <td className="px-8 py-5 font-black text-green-600">Rs. {order.commission}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}