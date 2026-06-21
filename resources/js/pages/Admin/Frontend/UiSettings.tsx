import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Palette, Save, Eye, Settings2, ListChecks } from 'lucide-react';
import { useState } from 'react';
import toast from "react-hot-toast";

export default function UiSettings({ settings }: { settings: any }) {
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, post, processing } = useForm({
        header_color: settings.header_color || 'green-2',
        footer_color: settings.footer_color || 'green-2',
        font: settings.font || 'Roboto',
        marquee_text: settings.marquee_text || '',
        brand_show: settings.brand_show || 'ok',
        featured_show: settings.featured_show || 'ok',
        blog_show: settings.blog_show || 'ok',
        todays_deal_show: settings.todays_deal_show || 'ok',
        header_homepage_status: settings.header_homepage_status || 'yes',
        header_all_categories_status: settings.header_all_categories_status || 'yes',
        header_featured_products_status: settings.header_featured_products_status || 'yes',
        header_todays_deal_status: settings.header_todays_deal_status || 'yes',
        header_latest_products_status: settings.header_latest_products_status || 'yes',
        header_blogs_status: settings.header_blogs_status || 'no',
        header_contact_status: settings.header_contact_status || 'yes',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ui-settings.store'), {
            onSuccess: () => toast.success('Sari settings save ho gayin!'),
        });
    };

    const StatusSelect = ({ label, field, options = ['yes', 'no'] }: any) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {label.replace(/_/g, ' ')}
            </label>
            <select
                value={data[field as keyof typeof data]}
                onChange={e => setData(field as any, e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                ))}
            </select>
        </div>
    );

    return (
        <AppLayout>
            <Head title="UI Settings" />
            <div className="max-w-6xl mx-auto py-8 px-4 pb-24">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Settings2 className="text-indigo-600" /> Pansari Inn Settings
                    </h1>
                    <button 
                        type="submit"
                        form="ui-settings-form"
                        disabled={processing} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> {processing ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl mb-8 w-fit border border-gray-200 dark:border-gray-700">
                    {[
                        { id: 'general', label: 'General', icon: Palette },
                        { id: 'visibility', label: 'Section Display', icon: Eye },
                        { id: 'header', label: 'Menu Status', icon: ListChecks },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <form id="ui-settings-form" onSubmit={submit}>
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <h2 className="text-xl font-semibold mb-6">Theme Appearance</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Header Color Name</label>
                                        <input type="text" value={data.header_color} onChange={e => setData('header_color', e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Footer Color Name</label>
                                        <input type="text" value={data.footer_color} onChange={e => setData('footer_color', e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Font Family</label>
                                        <input type="text" value={data.font} onChange={e => setData('font', e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Marquee Text</label>
                                        <textarea value={data.marquee_text} onChange={e => setData('marquee_text', e.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'visibility' && (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatusSelect label="Show Brands" field="brand_show" options={['ok', 'no']} />
                            <StatusSelect label="Show Featured" field="featured_show" options={['ok', 'no']} />
                            <StatusSelect label="Show Blog" field="blog_show" options={['ok', 'no']} />
                            <StatusSelect label="Todays Deal" field="todays_deal_show" options={['ok', 'no']} />
                        </div>
                    )}

                    {activeTab === 'header' && (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Header Navigation Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <StatusSelect label="Home Page" field="header_homepage_status" />
                                <StatusSelect label="Categories" field="header_all_categories_status" />
                                <StatusSelect label="Featured" field="header_featured_products_status" />
                                <StatusSelect label="Todays Deal" field="header_todays_deal_status" />
                                <StatusSelect label="Latest" field="header_latest_products_status" />
                                <StatusSelect label="Blogs" field="header_blogs_status" />
                                <StatusSelect label="Contact" field="header_contact_status" />
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}