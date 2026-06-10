import { useForm } from '@inertiajs/react';
import { Save, Share2, ShieldCheck } from 'lucide-react';
import toast from "react-hot-toast";

export default function GatewaysTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        ssl_set: settings.ssl_set?.status || 'no',
        ssl_store_id: settings.ssl_store_id?.value || '',
        ssl_store_passwd: settings.ssl_store_passwd?.value || '',
        ssl_type: settings.ssl_type?.value || 'sandbox',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/gateways', {
            preserveScroll: true,
            onSuccess: () => toast.success('External gateways updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2">
                <Share2 className="text-indigo-600" /> External Gateways
            </h3>

            <div className={`p-8 rounded-3xl border-2 transition-all ${data.ssl_set === 'ok' ? 'border-indigo-500 bg-indigo-50/10' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-6">
                    <span className="font-black text-lg text-indigo-900 uppercase">SSL Commerz (Local)</span>
                    <select value={data.ssl_set} onChange={e => setData('ssl_set', e.target.value)} className="rounded-xl border-gray-200 font-bold">
                        <option value="ok">Enabled</option>
                        <option value="no">Disabled</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500">Store ID</label>
                        <input type="text" value={data.ssl_store_id} onChange={e => setData('ssl_store_id', e.target.value)} className="h-12 w-full rounded-xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500">Store Password</label>
                        <input type="password" value={data.ssl_store_passwd} onChange={e => setData('ssl_store_passwd', e.target.value)} className="h-12 w-full rounded-xl border-gray-200" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-bold text-gray-500 block mb-2">Mode</label>
                        <select value={data.ssl_type} onChange={e => setData('ssl_type', e.target.value)} className="h-12 w-full rounded-xl border-gray-200">
                            <option value="sandbox">Sandbox (Test Mode)</option>
                            <option value="live">Live Mode</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE GATEWAYS'}
                </button>
            </div>
        </form>
    );
}