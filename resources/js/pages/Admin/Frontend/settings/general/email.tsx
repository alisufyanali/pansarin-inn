import { useForm } from '@inertiajs/react';
import { Save, Mail, Server, Shield } from 'lucide-react';
import toast from "react-hot-toast";

export default function EmailTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
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
        post((window as any).route('admin.general-settings.updateEmail'), {
            onSuccess: () => toast.success('SMTP Configuration Saved!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <Mail className="w-6 h-6 text-indigo-600" /> SMTP & Email Server
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">SMTP Host</label>
                    <div className="relative">
                        <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={data.mail_host} onChange={e => setData('mail_host', e.target.value)} className="h-14 pl-12 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="smtp.mailtrap.io" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">SMTP Port</label>
                    <input type="number" value={data.mail_port} onChange={e => setData('mail_port', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="587" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Username / Email</label>
                    <input type="text" value={data.mail_username} onChange={e => setData('mail_username', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Password</label>
                    <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="password" value={data.mail_password} onChange={e => setData('mail_password', e.target.value)} className="h-14 pl-12 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg">
                    <Save className="w-6 h-6" /> SAVE SMTP
                </button>
            </div>
        </form>
    );
}