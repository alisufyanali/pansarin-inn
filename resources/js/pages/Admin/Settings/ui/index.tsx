import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Palette, ListChecks, Home, LayoutGrid, ShoppingBag, Mail, Megaphone } from 'lucide-react';

import BrandingTab from './branding';
import HeaderTab from './header';
import HomepageTab from './homepage';
import CategoriesTab from './categories';
import ProductsTab from './products';
import EmailTab from './email';
import MarketingTab from './marketing';

export default function UiSettingsIndex({ settings }: { settings: any }) {
    const [activeTab, setActiveTab] = useState('branding');

    const tabs = [
        { id: 'branding', label: 'Branding', icon: Palette, component: BrandingTab },
        { id: 'header', label: 'Header', icon: ListChecks, component: HeaderTab },
        { id: 'homepage', label: 'Homepage', icon: Home, component: HomepageTab },
        { id: 'categories', label: 'Categories', icon: LayoutGrid, component: CategoriesTab },
        { id: 'products', label: 'Products', icon: ShoppingBag, component: ProductsTab },
        { id: 'email', label: 'Email UI', icon: Mail, component: EmailTab },
        { id: 'marketing', label: 'Marketing', icon: Megaphone, component: MarketingTab },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || BrandingTab;

    return (
        <AppLayout>
            <Head title="UI Settings" />
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
                    <div className="flex-1 bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
                        <ActiveComponent settings={settings} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}