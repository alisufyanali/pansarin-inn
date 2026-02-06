import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { 
    Settings, Phone, Globe, ShieldCheck, ShoppingCart, 
    Mail, Lock, Terminal, FileText, Cpu, HeartPulse 
} from 'lucide-react';

import SystemTab from './system';
import ContactTab from './contact';
import SeoTab from './seo';
import AuthTab from './auth';
import EcommerceTab from './ecommerce';
import EmailTab from './email';
import SecurityTab from './security';
import IntegrationsTab from './integrations';
import LegalTab from './legal';
import AdvancedTab from './advanced';

export default function GeneralSettingsIndex({ settings }: { settings: any }) {
    const [activeTab, setActiveTab] = useState('system');

    const tabs = [
        { id: 'system', label: 'System Basics', icon: Settings, component: SystemTab },
        { id: 'contact', label: 'Contact & Footer', icon: Phone, component: ContactTab },
        { id: 'seo', label: 'SEO & Meta', icon: Globe, component: SeoTab },
        { id: 'auth', label: 'Authentication', icon: ShieldCheck, component: AuthTab },
        { id: 'ecommerce', label: 'Ecommerce', icon: ShoppingCart, component: EcommerceTab },
        { id: 'email', label: 'SMTP Settings', icon: Mail, component: EmailTab },
        { id: 'security', label: 'Security', icon: Lock, component: SecurityTab },
        { id: 'integrations', label: 'Integrations', icon: Terminal, component: IntegrationsTab },
        { id: 'legal', label: 'Legal Pages', icon: FileText, component: LegalTab },
        { id: 'advanced', label: 'Advanced', icon: Cpu, component: AdvancedTab },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || SystemTab;

    return (
        <AppLayout>
            <Head title="General Settings" />
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