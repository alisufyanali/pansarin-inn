import { useForm } from '@inertiajs/react';
import { Save, ShieldAlert, Key } from 'lucide-react';
import toast from "react-hot-toast";

export default function SecurityTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        captcha_status: settings.captcha_status || 'no',
        captcha_key: settings.captcha_key || '',
        captcha_secret: settings.captcha_secret || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateSecurity'), {
            onSuccess: () => toast.success('Security settings saved!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="text-red-500" /> Security & Captcha</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="font-bold">Google reCAPTCHA Status</span>
                    <select value={data.captcha_status} onChange={e => setData('captcha_status', e.target.value)} className="rounded-lg border-gray-200">
                        <option value="yes">Enabled</option><option value="no">Disabled</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-bold">Site Key</label><input type="text" value={data.captcha_key} onChange={e => setData('captcha_key', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" /></div>
                    <div className="space-y-2"><label className="text-sm font-bold">Secret Key</label><input type="password" value={data.captcha_secret} onChange={e => setData('captcha_secret', e.target.value)} className="w-full h-12 rounded-xl border-gray-200" /></div>
                </div>
            </div>
            <div className="flex justify-end"><button disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Update Security</button></div>
        </form>
    );
}