import { useForm } from '@inertiajs/react';
import { Mail, Save, Server, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        mail_driver: settings.mail_driver || 'smtp',
        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || '587',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/email', {
            preserveScroll: true,
            onSuccess: () => toast.success('SMTP Configuration Saved!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="animate-in space-y-8 fade-in">
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800">
                <Mail className="h-6 w-6 text-indigo-600" /> SMTP & Email Server
            </h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">
                        SMTP Host
                    </label>
                    <div className="relative">
                        <Server className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={data.mail_host}
                            onChange={(e) =>
                                setData('mail_host', e.target.value)
                            }
                            className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 pl-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="smtp.mailtrap.io"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">
                        SMTP Port
                    </label>
                    <input
                        type="number"
                        value={data.mail_port}
                        onChange={(e) => setData('mail_port', e.target.value)}
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="587"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">
                        Username / Email
                    </label>
                    <input
                        type="text"
                        value={data.mail_username}
                        onChange={(e) =>
                            setData('mail_username', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">
                        Password
                    </label>
                    <div className="relative">
                        <Shield className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            value={data.mail_password}
                            onChange={(e) =>
                                setData('mail_password', e.target.value)
                            }
                            className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 pl-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE EMAIL CONFIGURATIONS'}
                </button>
            </div>
        </form>
    );
}
