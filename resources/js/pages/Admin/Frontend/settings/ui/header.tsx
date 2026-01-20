import { useForm } from '@inertiajs/react';
import { Save, ListChecks } from 'lucide-react';
import toast from "react-hot-toast";

export default function HeaderTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        header_homepage_status: settings.header_homepage_status || 'yes',
        header_all_categories_status: settings.header_all_categories_status || 'yes',
        header_featured_products_status: settings.header_featured_products_status || 'yes',
        header_todays_deal_status: settings.header_todays_deal_status || 'yes',
        header_blogs_status: settings.header_blogs_status || 'no',
        header_contact_status: settings.header_contact_status || 'yes',
        header_store_locator_status: settings.header_store_locator_status || 'yes',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ui-settings.store'), { onSuccess: () => toast.success('Header Updated!') });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><ListChecks className="w-5 h-5 text-indigo-500" /> Navigation Menu Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(data).map((key) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">{key.replace('header_', '').replace('_status', '').replace(/_/g, ' ')}</label>
                        <select 
                            value={data[key as keyof typeof data]} 
                            onChange={e => setData(key as any, e.target.value)}
                            className="rounded-lg border-gray-300 text-sm"
                        >
                            <option value="yes">Visible</option>
                            <option value="no">Hidden</option>
                        </select>
                    </div>
                ))}
            </div>
            <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Navigation
            </button>
        </form>
    );
}