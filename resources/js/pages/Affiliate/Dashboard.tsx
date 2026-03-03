import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Users, Package, Copy, ExternalLink, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import toast from "react-hot-toast";

interface Referral {
    id: number;
    name: string;
    email: string;
    created_at: string;
    total_purchases: number;
    total_commission: string;
}

interface Product {
    id: number;
    name: string;
    sale_price: number;
    commission_amount: number;
}

interface Props {
    products: Product[];
    affiliateCode: string;
    referrals: Referral[];
    stats: {
        total_referrals: number;
        total_earnings: string;
        commission_rate: number;
    };
}

export default function Dashboard({ products, affiliateCode, referrals, stats }: Props) {
    
    const copyReferralLink = () => {
        const link = `${window.location.origin}/register-affiliate?ref=${affiliateCode}`;
        navigator.clipboard.writeText(link);
        toast.success('Main referral link copied!');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Affiliate Dashboard', href: '/affiliate/dashboard' }]}>
            <Head title="Affiliate Dashboard" />

            <div className="space-y-10 pb-10 px-4 sm:px-0">
                
                {/* 1. Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium">Available Earnings</p>
                            <h2 className="text-5xl font-black mt-2">${stats.total_earnings}</h2>
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs">
                                <TrendingUp size={14} /> Total Profit
                            </div>
                        </div>
                        <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Referrals</p>
                            <h3 className="text-4xl font-bold dark:text-white mt-2">{stats.total_referrals}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-bold">
                            <Users size={18} /> Active Network
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Your Code</p>
                        <div className="flex items-center justify-between mt-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-2xl font-mono font-black text-blue-600 tracking-widest">{affiliateCode}</span>
                            <button onClick={copyReferralLink} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition text-blue-600">
                                <Copy size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Referrals Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                <Users size={20} />
                            </div>
                            <h2 className="font-bold text-xl dark:text-white">Recent Referrals & Earnings</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Customer Details</th>
                                    <th className="px-8 py-5 text-center">Orders</th>
                                    <th className="px-8 py-5 text-center">Joined Date</th>
                                    <th className="px-8 py-5">Total Commission</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {referrals.length > 0 ? referrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{ref.name}</div>
                                            <div className="text-xs text-gray-400">{ref.email}</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium dark:text-gray-300">
                                                {ref.total_purchases}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center text-sm text-gray-500">
                                            {ref.created_at}
                                        </td>
                                        <td className="px-8 py-5 font-black text-green-600">
                                            ${ref.total_commission}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link 
                                                href={`/affiliate/referral/${ref.id}`} 
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-sm"
                                            >
                                                View <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-gray-400">
                                            No active referrals found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Products Promotion */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white">
                            <Package className="text-blue-500" /> Profitable Products
                        </h2>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase">
                            Rate: {stats.commission_rate}%
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
                                <div className="p-8">
                                    <h3 className="font-black text-xl dark:text-white group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                    
                                    <div className="mt-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 uppercase tracking-tighter font-semibold">Price</span>
                                            <span className="font-bold dark:text-gray-200">${product.sale_price}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                                            <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase">You Earn</span>
                                            <span className="font-black text-green-600 text-lg">${product.commission_amount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            const link = `${window.location.origin}/register-affiliate?ref=${affiliateCode}&product=${product.id}`;
                                            navigator.clipboard.writeText(link);
                                            toast.success('Promo link copied!');
                                        }}
                                        className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold shadow-lg group-hover:scale-[1.02]"
                                    >
                                        <ExternalLink size={18} /> Copy Promo Link
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}