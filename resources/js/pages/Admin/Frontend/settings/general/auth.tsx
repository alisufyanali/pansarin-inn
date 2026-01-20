import { useForm } from '@inertiajs/react';
import { Save, Facebook, Chrome as Google, Shield } from 'lucide-react';
import toast from "react-hot-toast";

export default function AuthTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        google_login: settings.google_login || 'no',
        google_client_id: settings.google_client_id || '',
        facebook_login: settings.facebook_login || 'no',
        facebook_app_id: settings.facebook_app_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateAuth'), {
            onSuccess: () => toast.success('Authentication settings updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-10 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <Shield className="w-6 h-6 text-indigo-600" /> Social Authentication
            </h3>

            <div className="space-y-8">
                {/* Google Auth */}
                <div className="p-8 rounded-3xl border border-blue-50 bg-blue-50/20 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Google className="text-red-500 w-6 h-6" /><span className="font-bold">Google Login</span></div>
                        <select value={data.google_login} onChange={e => setData('google_login', e.target.value)} className="rounded-xl border-gray-200">
                            <option value="yes">Active</option><option value="no">Inactive</option>
                        </select>
                    </div>
                    <input type="text" value={data.google_client_id} onChange={e => setData('google_client_id', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" placeholder="Google Client ID" />
                </div>

                {/* Facebook Auth */}
                <div className="p-8 rounded-3xl border border-indigo-50 bg-indigo-50/20 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Facebook className="text-blue-600 w-6 h-6" /><span className="font-bold">Facebook Login</span></div>
                        <select value={data.facebook_login} onChange={e => setData('facebook_login', e.target.value)} className="rounded-xl border-gray-200">
                            <option value="yes">Active</option><option value="no">Inactive</option>
                        </select>
                    </div>
                    <input type="text" value={data.facebook_app_id} onChange={e => setData('facebook_app_id', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" placeholder="Facebook App ID" />
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg hover:bg-indigo-700">
                    <Save className="w-6 h-6" /> SAVE LOGIN SETTINGS
                </button>
            </div>
        </form>
    );
}