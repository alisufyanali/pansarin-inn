import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Settings, Save, Store, Mail, Phone, MapPin } from 'lucide-react';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Frontend Settings', href: '#' },
    { title: 'General Settings', href: '/admin/frontend/general-settings' },
];

interface Props {
    settings: Record<string, string>;
}

export default function GeneralSettings({ settings }: Props) {
    const { data, setData, post, processing } = useForm({
        system_name: settings.system_name || '',
        system_email: settings.system_email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        footer_text: settings.footer_text || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.general-settings.store'), {
            onSuccess: () => toast.success('General settings updated successfully!'),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Settings" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" />
                        General Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your basic store information and contact details.</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        
                        {/* System Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <Store className="w-4 h-4" /> System Name
                            </label>
                            <input
                                type="text"
                                value={data.system_name}
                                onChange={e => setData('system_name', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500"
                                placeholder="Pansari Inn"
                            />
                        </div>

                        {/* System Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="w-4 h-4" /> Store Email
                                </label>
                                <input
                                    type="email"
                                    value={data.system_email}
                                    onChange={e => setData('system_email', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4" /> Store Address
                            </label>
                            <textarea
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                rows={3}
                            />
                        </div>

                        {/* Footer Text */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Footer Copyright Text
                            </label>
                            <input
                                type="text"
                                value={data.footer_text}
                                onChange={e => setData('footer_text', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}