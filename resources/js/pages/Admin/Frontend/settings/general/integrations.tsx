import { useForm } from '@inertiajs/react';
import { BarChart, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IntegrationsTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        facebook_pixel_id: settings.facebook_pixel_id || '',
        google_tag_manager_id: settings.google_tag_manager_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/integrations', {
            preserveScroll: true,
            onSuccess: () => toast.success('Integrations updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold">
                <BarChart className="text-indigo-600" /> Marketing Integrations
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">
                        Facebook Pixel ID
                    </label>
                    <input
                        type="text"
                        value={data.facebook_pixel_id}
                        onChange={(e) =>
                            setData('facebook_pixel_id', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">
                        Google Tag Manager ID
                    </label>
                    <input
                        type="text"
                        value={data.google_tag_manager_id}
                        onChange={(e) =>
                            setData('google_tag_manager_id', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE INTEGRATIONS'}
                </button>
            </div>
        </form>
    );
}
