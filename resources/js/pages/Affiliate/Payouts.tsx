import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Wallet, 
    Plus, 
    CreditCard, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Building2,
    ArrowUpRight,
    Trash2,
    TrendingUp,
    DollarSign,
    ArrowRightLeft
} from 'lucide-react';

interface PaymentMethod {
    id: number;
    provider: string;
    account_name: string;
    account_number: string;
    iban_number: string | null;
    is_primary: boolean;
}

interface PayoutHistory {
    id: number;
    amount: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    transaction_id: string | null;
    method: string;
    account_name: string;
    account_number: string;
    date: string;
    admin_note: string | null;
}

interface PayoutsProps {
    wallet_balance: string;
    pending_balance: string; // Controller se pass karein
    total_paid: string;      // Controller se pass karein
    raw_balance: number;
    payment_methods: PaymentMethod[];
    payout_history: PayoutHistory[];
}

export default function Payouts({ 
    wallet_balance, 
    pending_balance = '0.00', 
    total_paid = '0.00', 
    raw_balance, 
    payment_methods, 
    payout_history 
}: PayoutsProps) {
    const [showMethodModal, setShowMethodModal] = useState(false);

    // Form 1: Payout Request Form
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method_id: payment_methods.find(m => m.is_primary)?.id.toString() || '',
    });

    // Form 2: New Payment Method Form
    const methodForm = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        iban_number: '',
    });

    const handlePayoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('affiliate.payouts.request'), {
            onSuccess: () => reset('amount'),
        });
    };

    const handleMethodSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        methodForm.post(route('affiliate.payment-methods.store'), {
            onSuccess: () => {
                setShowMethodModal(false);
                methodForm.reset();
            },
        });
    };

    const handleDeleteMethod = (id: number) => {
        if (confirm('Kya aap yeh payment method delete karna chahte hain?')) {
            router.delete(route('affiliate.payment-methods.destroy', { id: id }), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: PayoutHistory['status']) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
            processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
            rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
        };

        const icons = {
            pending: <Clock className="w-3.5 h-3.5 mr-1" />,
            processing: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
            completed: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
            rejected: <XCircle className="w-3.5 h-3.5 mr-1" />,
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {icons[status]}
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Payouts & Wallet', href: '/affiliate/payouts' }]}>
            <Head title="Affiliate Payouts" />

            <div className="space-y-10 pb-10 px-4 sm:px-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Payouts & Wallet</h1>
                    <p className="text-sm text-gray-500 mt-1">Apni earnings withdraw karein aur payment accounts manage karein.</p>
                </div>

                {/* 1. Sync Dynamic Cards Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Available Balance */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium">Available Balance</p>
                            <h2 className="text-5xl font-black mt-2">Rs.{wallet_balance}</h2>
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs">
                                <TrendingUp size={14} /> Ready to Withdraw
                            </div>
                        </div>
                        <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Card 2: Pending Withdrawals */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Balance</p>
                            <h3 className="text-4xl font-bold dark:text-white mt-2 text-amber-600 dark:text-amber-500">Rs.{pending_balance}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-amber-500 text-sm font-bold">
                            <Clock size={18} /> Awaiting Verification
                        </div>
                    </div>

                    {/* Card 3: Total Earnings Withdrawn */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Paid</p>
                            <h3 className="text-4xl font-bold dark:text-white mt-2 text-emerald-600 dark:text-emerald-500">Rs.{total_paid}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <CheckCircle size={18} /> Successfully Cleared
                        </div>
                    </div>
                </div>

                {/* 2. Main Layout Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Request Payout Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm space-y-6">
                        <div className="flex items-center space-x-2 border-b border-gray-50 dark:border-gray-800 pb-4">
                            <ArrowUpRight className="w-5 h-5 text-blue-500" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdrawal Request Bhein</h3>
                        </div>

                        {payment_methods.length === 0 ? (
                            <div className="p-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center space-y-4">
                                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Withdraw karne ke liye pehle apna koi Payment Account add karein.</p>
                                <button 
                                    onClick={() => setShowMethodModal(true)}
                                    className="inline-flex items-center px-5 py-2.5 bg-gray-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Account Add Karein
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePayoutSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (Rs.)</label>
                                    <input 
                                        type="number"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Minimum 500"
                                    />
                                    {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                                    <p className="text-xs text-gray-400 mt-2">The minimum withdrawal amount is Rs. 500.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Payment Account</label>
                                    <select 
                                        value={data.payment_method_id}
                                        onChange={e => setData('payment_method_id', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 transition"
                                    >
                                        {payment_methods.map(method => (
                                            <option key={method.id} value={method.id}>
                                                {method.provider} — {method.account_name} ({method.account_number})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.payment_method_id && <p className="text-xs text-rose-600 mt-1">{errors.payment_method_id}</p>}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || raw_balance < 500}
                                    className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition shadow-md"
                                >
                                    {processing ? 'Submitting...' : 'Request Payout'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Saved Accounts Configuration */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-4">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Accounts</h3>
                            </div>
                            <button 
                                onClick={() => setShowMethodModal(true)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl text-blue-600 border border-blue-100 dark:border-blue-900/50 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {payment_methods.map(method => (
                                <div key={method.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 relative group transition hover:border-gray-200">
                                    {method.is_primary && (
                                        <span className="absolute top-3 right-3 text-[10px] bg-gray-900 dark:bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Primary</span>
                                    )}
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-0.5">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{method.provider}</p>
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{method.account_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">A/C: {method.account_number}</p>
                                            {method.iban_number && <p className="text-[11px] text-gray-400 font-mono">IBAN: {method.iban_number}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleDeleteMethod(method.id)}
                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                            title="Delete Account"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. History Clean Logs Component */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center space-x-2">
                        <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payout History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                                    <th className="py-5 px-8">Date</th>
                                    <th className="py-5 px-8">Method & Account</th>
                                    <th className="py-5 px-8">Amount</th>
                                    <th className="py-5 px-8">Status</th>
                                    <th className="py-5 px-8">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                                {payout_history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400">No old transaction history found.</td>
                                    </tr>
                                ) : (
                                    payout_history.map(payout => (
                                        <tr key={payout.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            <td className="py-5 px-8 font-bold text-gray-900 dark:text-100">{payout.date}</td>
                                            <td className="py-5 px-8">
                                                <div className="font-bold text-gray-900 dark:text-white">{payout.method}</div>
                                                <div className="text-xs text-gray-400 font-medium">{payout.account_name} ({payout.account_number})</div>
                                            </td>
                                            <td className="py-5 px-8 font-black text-gray-900 dark:text-white">Rs. {payout.amount}</td>
                                            <td className="py-5 px-8">{getStatusBadge(payout.status)}</td>
                                            <td className="py-5 px-8 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                {payout.transaction_id ? (
                                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{payout.transaction_id}</span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600 italic">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Components */}
            {showMethodModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-xl border dark:border-gray-800">
                        <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Payment Account</h3>
                            <button onClick={() => setShowMethodModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-semibold">Cancel</button>
                        </div>
                        <form onSubmit={handleMethodSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provider Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g., EasyPaisa, JazzCash, HBL, Meezan"
                                    value={methodForm.data.provider}
                                    onChange={e => methodForm.setData('provider', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Title / Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Account holder name"
                                    value={methodForm.data.account_name}
                                    onChange={e => methodForm.setData('account_name', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Number / Mobile Number</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Account number or wallet number"
                                    value={methodForm.data.account_number}
                                    onChange={e => methodForm.setData('account_number', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IBAN Number (Optional)</label>
                                <input 
                                    type="text"
                                    placeholder="PK00XXXX0000000000000000"
                                    value={methodForm.data.iban_number || ''}
                                    onChange={e => methodForm.setData('iban_number', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={methodForm.processing}
                                className="w-full py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:opacity-50 shadow-md"
                            >
                                Save Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}