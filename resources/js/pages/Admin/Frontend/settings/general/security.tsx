import { useForm } from '@inertiajs/react';
import { Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        captcha_status: settings.captcha_status || 'no',
        captcha_key: settings.captcha_key || '',
        captcha_secret: settings.captcha_secret || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/general/security', {
            preserveScroll: true,
            onSuccess: () => toast.success('Security settings saved!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold">
                <ShieldAlert className="text-red-500" /> Security & Captcha
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <span className="font-bold">Google reCAPTCHA Status</span>
                    <select
                        value={data.captcha_status}
                        onChange={(e) =>
                            setData('captcha_status', e.target.value)
                        }
                        className="rounded-lg border-gray-200"
                    >
                        <option value="yes">Enabled</option>
                        <option value="no">Disabled</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Site Key</label>
                        <input
                            type="text"
                            value={data.captcha_key}
                            onChange={(e) =>
                                setData('captcha_key', e.target.value)
                            }
                            className="h-12 w-full rounded-xl border-gray-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Secret Key</label>
                        <input
                            type="password"
                            value={data.captcha_secret}
                            onChange={(e) =>
                                setData('captcha_secret', e.target.value)
                            }
                            className="h-12 w-full rounded-xl border-gray-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE SECURITY'}
                </button>
            </div>
        </form>
    );
}
