import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, Mail, MapPin, User, Phone, Wallet, Award, ShoppingBag, ShieldCheck } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader from '@/components/PageHeader';

interface Customer {
    id: number;
    first_name: string;
    last_name: string | null;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    total_spent: number;
    total_orders: number;
    wallet?: {
        balance: number;
        wallet_transactions?: any[];
    };
    loyalty_points?: {
        balance: number;
    };
    loyalty_transactions?: any[];
    referred_by?: any;
    
    customer_group?: {
        name: string;
    };
    city_id: number | null;
    country: string | null;
    city?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export default function Show({ customer }: { customer: Customer }) {
    const fullName = `${customer.first_name} ${customer.last_name || ''}`.trim();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/admin/customers' },
        { title: fullName, href: `/admin/customers/${customer.id}` },
        { title: 'Details', href: '#' },
    ];

    const actions = (
        <Link
            href={`/admin/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
            <Edit2 className="w-4 h-4" />
            Edit
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${fullName}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <PageHeader
                    title={fullName}
                    backUrl="/admin/customers"
                    actions={actions}
                />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Wallet Balance</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">Rs. {customer.wallet?.balance || '0.00'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Award className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Loyalty Points</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{customer.loyalty_points?.balance || 0} Pts</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><ShoppingBag className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Total Orders</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{customer.total_orders || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ShieldCheck className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Group</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{customer.customer_group?.name || 'General'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Wider area for Tables and Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <SectionCard title="Personal Information" icon={User}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <InfoRow label="Full Name" value={fullName} />
                                <InfoRow label="Status" value={customer.status?.toUpperCase()} />
                                <InfoRow label="Phone" value={customer.phone} />
                                <InfoRow label="Email" value={customer.email || '-'} />
                             </div>
                        </SectionCard>

                        {/* WALLET TRANSACTIONS: Wide column mein rakha taake data readable ho */}
                        <SectionCard title="Recent Wallet Transactions" icon={Wallet}>
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-sm text-left border-t border-gray-100 dark:border-gray-800">
                                    <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                                            <th className="px-6 py-3 font-medium text-gray-500">Action</th>
                                            <th className="px-6 py-3 font-medium text-gray-500 text-right">Amount</th>
                                            <th className="px-6 py-3 font-medium text-gray-500 text-center">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {/* Dono naming conventions check kar li hain (snake_case aur camelCase) */}
                                        {(customer.wallet?.wallet_transactions || (customer.wallet as any)?.walletTransactions)?.length > 0 ? (
                                            (customer.wallet?.wallet_transactions || (customer.wallet as any)?.walletTransactions).map((t: any) => (
                                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-3">{new Date(t.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-3">{t.action}</td>
                                                    <td className="px-6 py-3 font-bold text-right">Rs. {t.amount}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${t.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400 italic">No wallet activity found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>

                        {/* LOYALTY HISTORY */}
                        <SectionCard title="Loyalty Points History" icon={Award}>
                            <div className="space-y-3">
                                {(customer.loyalty_transactions || (customer as any)?.loyaltyTransactions)?.length > 0 ? (
                                    (customer.loyalty_transactions || (customer as any)?.loyaltyTransactions).map((lt: any) => (
                                        <div key={lt.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{lt.reason || 'Point Transaction'}</p>
                                                <p className="text-xs text-gray-500">{new Date(lt.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <p className={`font-bold ${lt.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {lt.points > 0 ? '+' : ''}{lt.points} Pts
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-4 text-gray-400 italic text-sm">No points history available.</p>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Info */}
                    <div className="space-y-6">
                        <SectionCard title="Referral Source" icon={ShieldCheck}>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase">Invited By</p>
                                <p className="text-sm font-bold text-blue-600">
                                    {(customer as any).referred_by?.affiliate?.user?.name || 'Organic / Direct'}
                                </p>
                            </div>
                        </SectionCard>

                        <SectionCard title="Address Details" icon={MapPin}>
                             <div className="space-y-4 text-sm">
                                <InfoRow label="Street" value={customer.address || '-'} />
                                <InfoRow label="City" value={customer.city?.name || '-'} />
                                <InfoRow label="Country" value={customer.country || '-'} />
                             </div>
                        </SectionCard>

                        <SectionCard title="Account Activity" icon={User}>
                            <div className="space-y-4">
                                <InfoRow label="Registered" value={new Date(customer.created_at).toLocaleDateString()} />
                                <InfoRow label="Total Spent" value={`Rs. ${customer.total_spent || '0'}`} />
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}