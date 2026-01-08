import React from 'react';
import { useForm, Head } from '@inertiajs/react';

interface SettingsProps {
    settings: {
        default_commission: string;
        min_payout: string;
        cookie_duration: string;
    }
}

export default function SystemSettings({ settings }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        default_commission: settings.default_commission || '5',
        min_payout: settings.min_payout || '1000',
        cookie_duration: settings.cookie_duration || '30',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.affiliate.settings.update'));
    };

    return (
        <div className="p-6 max-w-2xl">
            <Head title="Affiliate Settings" />
            <h1 className="text-2xl font-bold mb-6">Affiliate System Settings</h1>

            <form onSubmit={submit} className="bg-white p-6 shadow rounded-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Commission (%)</label>
                    <input 
                        type="number" 
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={data.default_commission}
                        onChange={e => setData('default_commission', e.target.value)}
                    />
                    {errors.default_commission && <p className="text-red-500 text-xs mt-1">{errors.default_commission}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Payout Limit (Rs.)</label>
                    <input 
                        type="number" 
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={data.min_payout}
                        onChange={e => setData('min_payout', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cookie Duration (Days)</label>
                    <input 
                        type="number" 
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={data.cookie_duration}
                        onChange={e => setData('cookie_duration', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Kitne din tak customer ko affiliate se link rakhna hai.</p>
                </div>

                <button 
                    disabled={processing}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}