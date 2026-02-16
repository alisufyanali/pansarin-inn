import React from 'react';
import { Head } from '@inertiajs/react';

interface SiteProps {
    siteData: {
        general: { name: string; title: string };
        business: { currency: string; paypal_enabled: boolean };
        ui: { logo: string | null; theme: string };
    };
}

export default function Frontend({ siteData }: SiteProps) {
    // Line by Line Extraction:
    const { general, business, ui } = siteData;

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: '#f9fafb' }}>
            <Head title={general.title} />

            {/* Header section with Dynamic UI settings */}
            <header className="mb-10 p-6 rounded-2xl text-white shadow-xl" 
                    style={{ backgroundColor: ui.theme }}>
                <h1 className="text-4xl font-extrabold">{general.name}</h1>
                <p className="opacity-90">{general.title}</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Info Card */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Business Stats</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Default Currency:</span>
                            <span className="font-bold">{business.currency}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">PayPal Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                business.paypal_enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {business.paypal_enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* UI Config Card */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Visual Settings</h2>
                    <p className="text-gray-500 text-sm mb-2">Theme Color Code:</p>
                    <code className="bg-gray-100 p-2 rounded block text-center font-mono">
                        {ui.theme}
                    </code>
                </div>
            </main>
        </div>
    );
}