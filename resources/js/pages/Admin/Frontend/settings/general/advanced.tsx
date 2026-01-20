import { useForm } from '@inertiajs/react';
import { Save, Cpu, Trash2 } from 'lucide-react';
import toast from "react-hot-toast";

export default function AdvancedTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        cache_time: settings.cache_time || '60',
        debug_mode: settings.debug_mode || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateAdvanced'), {
            onSuccess: () => toast.success('Advanced settings saved!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-red-600"><Cpu /> Advanced System Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 border rounded-xl">
                    <label className="text-sm font-bold">Cache Time (Minutes)</label>
                    <input type="number" value={data.cache_time} onChange={e => setData('cache_time', e.target.value)} className="w-full rounded-lg border-gray-200" />
                </div>
                <div className="space-y-2 p-4 border rounded-xl flex items-center justify-between">
                    <label className="text-sm font-bold">Debug Mode</label>
                    <select value={data.debug_mode} onChange={e => setData('debug_mode', e.target.value)} className="rounded-lg border-gray-200">
                        <option value="yes">On</option><option value="no">Off</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end"><button disabled={processing} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Apply Changes</button></div>
        </form>
    );
}