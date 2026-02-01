import { useForm } from '@inertiajs/react';
import { ListChecks, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeaderTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
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

        post('/admin/settings/ui/header', {
            preserveScroll: true,
            onSuccess: () => toast.success('Header Updated!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
                <ListChecks className="h-5 w-5 text-indigo-500" /> Navigation
                Menu Control
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Object.keys(data).map((key) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">
                            {key
                                .replace('header_', '')
                                .replace('_status', '')
                                .replace(/_/g, ' ')}
                        </label>
                        <select
                            value={data[key as keyof typeof data]}
                            onChange={(e) =>
                                setData(key as any, e.target.value)
                            }
                            className="rounded-lg border-gray-300 text-sm"
                        >
                            <option value="yes">Visible</option>
                            <option value="no">Hidden</option>
                        </select>
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE HEADER SETTINGS'}
                </button>
            </div>
        </form>
    );
}
