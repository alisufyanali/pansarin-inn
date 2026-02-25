import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    CreditCard, Coins, Truck, Users, MessageCircle, 
    Share2, Zap 
} from 'lucide-react';

import PaymentsTab from './payments';
import CurrencyTab from './currency';
import ShippingTab from './shipping';
import VendorTab from './vendor';
import FaqsTab from './faqs';
import GatewaysTab from './gateways';
import AdvancedTab from './advanced';

export default function BusinessSettingsIndex({ settings }: { settings: any }) {
    const [activeTab, setActiveTab] = useState('payments');

    const tabs = [
        { id: 'payments', label: 'Payments', icon: CreditCard, component: PaymentsTab },
        { id: 'currency', label: 'Currency', icon: Coins, component: CurrencyTab },
        { id: 'shipping', label: 'Shipping', icon: Truck, component: ShippingTab },
        { id: 'vendor', label: 'Vendor & Commission', icon: Users, component: VendorTab },
        { id: 'faqs', label: 'FAQs', icon: MessageCircle, component: FaqsTab },
        { id: 'gateways', label: 'Other Gateways', icon: Share2, component: GatewaysTab },
        { id: 'advanced', label: 'Advanced Rules', icon: Zap, component: AdvancedTab },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PaymentsTab;

    return (
        <AppLayout>
            <Head title="Business Settings" />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Content Area */}
                    <div className="flex-1 bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm min-h-[600px]">
                        <ActiveComponent settings={settings} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}