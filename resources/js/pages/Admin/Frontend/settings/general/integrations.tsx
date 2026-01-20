import { useForm } from '@inertiajs/react';
import { Save, Terminal, BarChart } from 'lucide-react';
import toast from "react-hot-toast";

export default function IntegrationsTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        facebook_pixel_id: settings.facebook_pixel_id || '',
        google_tag_manager_id: settings.google_tag_manager_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateIntegrations'), {
            onSuccess: () => toast.success('Integrations updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><BarChart className="text-indigo-600" /> Marketing Integrations</h3>
            <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-bold">Facebook Pixel ID</label><input type="text" value={data.facebook_pixel_id} onChange={e => setData('facebook_pixel_id', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" /></div>
                <div className="space-y-2"><label className="text-sm font-bold">Google Tag Manager ID</label><input type="text" value={data.google_tag_manager_id} onChange={e => setData('google_tag_manager_id', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" /></div>
            </div>
            <div className="flex justify-end"><button disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save Integrations</button></div>
        </form>
    );
}