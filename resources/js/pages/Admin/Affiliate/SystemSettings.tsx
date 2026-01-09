import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface SettingsProps {
    settings: {
        default_commission: string;
        min_payout: string;
        cookie_duration: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Affiliate Settings',
        href: '/admin/affiliate/settings',
    },
];

export default function SystemSettings({ settings }: SettingsProps) {
    // Form handling using Inertia useForm
    const { data, setData, post, processing, errors } = useForm({
        default_commission: settings?.default_commission || '5',
        min_payout: settings?.min_payout || '1000',
        cookie_duration: settings?.cookie_duration || '30',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.affiliate.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Aap yahan success notification add kar sakte hain
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Settings" />

            <div className="p-6 max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Affiliate System Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global commission rates and payout rules.</p>
                </div>

                <form onSubmit={submit} className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 space-y-6">
                    {/* Default Commission */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Default Commission (%)
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                    errors.default_commission ? 'border-red-500' : ''
                                }`}
                                value={data.default_commission}
                                onChange={e => setData('default_commission', e.target.value)}
                                placeholder="5"
                            />
                        </div>
                        {errors.default_commission && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.default_commission}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">New affiliates ko automatically yeh percentage milegi.</p>
                    </div>

                    {/* Minimum Payout */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Minimum Payout Limit (Rs.)
                        </label>
                        <input 
                            type="number" 
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                errors.min_payout ? 'border-red-500' : ''
                            }`}
                            value={data.min_payout}
                            onChange={e => setData('min_payout', e.target.value)}
                            placeholder="1000"
                        />
                        {errors.min_payout && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.min_payout}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Kam az kam itne paise hone par affiliate payout request kar sakega.</p>
                    </div>

                    {/* Cookie Duration */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Cookie Duration (Days)
                        </label>
                        <input 
                            type="number" 
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                errors.cookie_duration ? 'border-red-500' : ''
                            }`}
                            value={data.cookie_duration}
                            onChange={e => setData('cookie_duration', e.target.value)}
                            placeholder="30"
                        />
                        {errors.cookie_duration && (
                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.cookie_duration}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Kitne din tak customer ko affiliate link ke sath track karna hai.</p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                        <button 
                            disabled={processing}
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {processing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}