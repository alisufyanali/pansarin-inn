import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Palette, ListChecks, Home, LayoutGrid, ShoppingBag, Mail, Megaphone, Layers } from 'lucide-react';

import BrandingTab from './branding';
import HeaderTab from './header';
import HomepageTab from './homepage';
import CategoriesTab from './categories';
import ProductsTab from './products';
import EmailTab from './email';
import MarketingTab from './marketing';
import CategoryProductsTab from './category-products';

interface Category {
    id: number;
    name: string;
    slug: string;
    products: { id: number; name: string; sku: string; thumbnail: string | null }[];
}

interface Props {
    settings: any;
    categories: Category[];
    categoryProducts: Record<number, number[]>;
}

export default function UiSettingsIndex({ settings, categories, categoryProducts }: Props) {
    const [activeTab, setActiveTab] = useState('branding');

    const tabs = [
        { id: 'branding',          label: 'Branding',          icon: Palette },
        { id: 'header',            label: 'Header',            icon: ListChecks },
        { id: 'homepage',          label: 'Homepage',          icon: Home },
        { id: 'categories',        label: 'Categories',        icon: LayoutGrid },
        { id: 'products',          label: 'Products',          icon: ShoppingBag },
        { id: 'category-products', label: 'Cat. Products',     icon: Layers },
        { id: 'email',             label: 'Email UI',          icon: Mail },
        { id: 'marketing',         label: 'Marketing',         icon: Megaphone },
    ];

    const settingsKey = JSON.stringify(settings);

    const renderTab = () => {
        switch (activeTab) {
            case 'branding':          return <BrandingTab          key={`branding-${settingsKey}`}          settings={settings} />;
            case 'header':            return <HeaderTab            key={`header-${settingsKey}`}            settings={settings} />;
            case 'homepage':          return <HomepageTab          key={`homepage-${settingsKey}`}          settings={settings} />;
            case 'categories':        return <CategoriesTab        key={`categories-${settingsKey}`}        settings={settings} />;
            case 'products':          return <ProductsTab          key={`products-${settingsKey}`}          settings={settings} />;
            case 'category-products': return <CategoryProductsTab  key="category-products"                  categories={categories} categoryProducts={categoryProducts} />;
            case 'email':             return <EmailTab             key={`email-${settingsKey}`}             settings={settings} />;
            case 'marketing':         return <MarketingTab         key={`marketing-${settingsKey}`}         settings={settings} />;
            default:                  return <BrandingTab          key={`branding-${settingsKey}`}          settings={settings} />;
        }
    };

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
                        {renderTab()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
