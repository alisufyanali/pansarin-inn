import { useForm } from '@inertiajs/react';
import { Facebook, Chrome as Google, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        google_login: settings.google_login || 'no',
        google_client_id: settings.google_client_id || '',
        facebook_login: settings.facebook_login || 'no',
        facebook_app_id: settings.facebook_app_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/auth', {
            preserveScroll: true,
            onSuccess: () => toast.success('Authentication settings updated!'),
            onError: () => toast.error("Something went wrong!"),
        });

    };

    return (
        <form onSubmit={submit} className="animate-in space-y-10 fade-in">
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800">
                <Shield className="h-6 w-6 text-indigo-600" /> Social
                Authentication
            </h3>

            <div className="space-y-8">
                {/* Google Auth */}
                <div className="space-y-4 rounded-3xl border border-blue-50 bg-blue-50/20 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Google className="h-6 w-6 text-red-500" />
                            <span className="font-bold">Google Login</span>
                        </div>
                        <select
                            value={data.google_login}
                            onChange={(e) =>
                                setData('google_login', e.target.value)
                            }
                            className="rounded-xl border-gray-200"
                        >
                            <option value="yes">Active</option>
                            <option value="no">Inactive</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        value={data.google_client_id}
                        onChange={(e) =>
                            setData('google_client_id', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200"
                        placeholder="Google Client ID"
                    />
                </div>

                {/* Facebook Auth */}
                <div className="space-y-4 rounded-3xl border border-indigo-50 bg-indigo-50/20 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Facebook className="h-6 w-6 text-blue-600" />
                            <span className="font-bold">Facebook Login</span>
                        </div>
                        <select
                            value={data.facebook_login}
                            onChange={(e) =>
                                setData('facebook_login', e.target.value)
                            }
                            className="rounded-xl border-gray-200"
                        >
                            <option value="yes">Active</option>
                            <option value="no">Inactive</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        value={data.facebook_app_id}
                        onChange={(e) =>
                            setData('facebook_app_id', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200"
                        placeholder="Facebook App ID"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE LOGIN SETTINGS'}
                </button>
            </div>
        </form>
    );
}
