import { useForm } from '@inertiajs/react';
import { Cpu, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdvancedTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        cache_time: settings.cache_time || '60',
        debug_mode: settings.debug_mode || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/advanced', {
            preserveScroll: true,
            onSuccess: () => toast.success('Advanced settings saved!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-red-600">
                <Cpu /> Advanced System Control
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border p-4">
                    <label className="text-sm font-bold">
                        Cache Time (Minutes)
                    </label>
                    <input
                        type="number"
                        value={data.cache_time}
                        onChange={(e) => setData('cache_time', e.target.value)}
                        className="w-full rounded-lg border-gray-200"
                    />
                </div>
                <div className="flex items-center justify-between space-y-2 rounded-xl border p-4">
                    <label className="text-sm font-bold">Debug Mode</label>
                    <select
                        value={data.debug_mode}
                        onChange={(e) => setData('debug_mode', e.target.value)}
                        className="rounded-lg border-gray-200"
                    >
                        <option value="yes">On</option>
                        <option value="no">Off</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'APPLU CHANGES'}
                </button>
            </div>
        </form>
    );
}
