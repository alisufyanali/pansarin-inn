import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Briefcase, Save, CheckCircle2, XCircle, Info } from 'lucide-react';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Frontend Settings', href: '#' },
    { title: 'Business Settings', href: '/admin/frontend/business-settings' },
];

interface SettingItem {
    id: number;
    type: string;
    value: string;
    status: string;
}

interface Props {
    settings: SettingItem[];
}

export default function BusinessSettings({ settings }: Props) {
    // Hamare controller ko array of objects chahiye
    const { data, setData, post, processing } = useForm({
        settings: settings.length > 0 ? settings : [
            { type: 'tax_system', value: '0', status: 'inactive' },
            { type: 'shipping_method', value: 'flat_rate', status: 'active' },
            { type: 'wallet_system', value: '0', status: 'active' },
            { type: 'coupon_system', value: '0', status: 'active' },
        ]
    });

    const handleToggle = (index: number) => {
        const newSettings = [...data.settings];
        newSettings[index].status = newSettings[index].status === 'active' ? 'inactive' : 'active';
        setData('settings', newSettings);
    };

    const handleValueChange = (index: number, val: string) => {
        const newSettings = [...data.settings];
        newSettings[index].value = val;
        setData('settings', newSettings);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.business-settings.store'), {
            onSuccess: () => toast.success('Business configurations updated!'),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Settings" />

            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-indigo-600" />
                        Business Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Configure your store's core business modules and activation toggles.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.settings.map((setting, index) => (
                            <div 
                                key={setting.type}
                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                            {setting.type.replace('_', ' ')}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {setting.status === 'active' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-xs font-semibold ${setting.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {setting.status === 'active' ? 'ENABLED' : 'DISABLED'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(index)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            setting.status === 'active' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                setting.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Configuration Value</label>
                                    <input
                                        type="text"
                                        value={setting.value}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                        placeholder="Enter value (e.g. 15% or flat_rate)"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Saving Changes...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Disabling a system here will hide the corresponding feature from the customer frontend, but data will remain in the database.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}