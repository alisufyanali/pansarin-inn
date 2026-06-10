import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Trophy, Zap, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterAffiliate({ isAffiliate }: { isAffiliate: boolean }) {
    const { post, processing } = useForm({});

    const handleJoin = () => {
        post(route('affiliate.join.submit'), {
            onSuccess: () => toast.success('Mubarak ho! Aap partner ban gaye hain.'),
            onError: () => toast.error('Kuch masla hua, dobara koshish karen.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Join Affiliate', href: '/affiliate/join' }]}>
            <Head title="Become a Partner" />

            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] shadow-xl p-8 md:p-12">
                    
                    {/* Decorative Background Icon */}
                    <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-[0.05] rotate-12">
                        <Trophy size={300} />
                    </div>

                    <div className="relative z-10">
                        {/* Header Section */}
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-6">
                            <Zap size={18} fill="currentColor" /> Exclusive Opportunity
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                            Hamare Saath Mil Kar <br />
                            <span className="text-blue-600 font-outline-2">Paisa Kamayein</span>
                        </h1>

                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            Hamare affiliate program ka hissa banien. Har successful referral par 
                            <span className="text-gray-900 dark:text-white font-bold"> 5% flat commission </span> 
                            hasil karen aur apne network ko grow hote dekhein.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <ShieldCheck className="text-green-500 mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold dark:text-gray-200">Trusted Payments</h4>
                                    <p className="text-sm text-gray-500">Waqt par aur mehfooz payments.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <Trophy className="text-yellow-500 mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold dark:text-gray-200">Bonus Rewards</h4>
                                    <p className="text-sm text-gray-500">Ziada referrals par extra rewards.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 border-t border-gray-50 dark:border-gray-800 pt-10">
                            {isAffiliate ? (
                                <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-5 rounded-2xl flex items-center justify-center gap-3 text-green-700 dark:text-green-400 font-bold">
                                    <CheckCircle size={24} />
                                    Aap pehle hi hamare Partner hain!
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleJoin}
                                        disabled={processing}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            'Activate My Affiliate Account'
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-400 text-center sm:text-left">
                                        By clicking, you agree to our <br className="hidden sm:block" />
                                        Affiliate Terms & Conditions.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}