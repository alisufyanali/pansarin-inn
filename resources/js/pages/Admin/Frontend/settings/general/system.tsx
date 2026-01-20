import { useForm } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
import toast from "react-hot-toast";

export default function SystemTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        system_name: settings.system_name || '',
        system_title: settings.system_title || '',
        application_name: settings.application_name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateSystem'), {
            onSuccess: () => toast.success('System Settings Updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Settings className="text-indigo-600" /> System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">System Name</label>
                    <input type="text" value={data.system_name} onChange={e => setData('system_name', e.target.value)} className="w-full h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">System Title</label>
                    <input type="text" value={data.system_title} onChange={e => setData('system_title', e.target.value)} className="w-full h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>
            <div className="flex justify-end"><button disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button></div>
        </form>
    );
}