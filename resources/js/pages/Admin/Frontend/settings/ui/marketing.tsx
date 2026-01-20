import { useForm } from '@inertiajs/react';
import { Save, MessageCircle, Share2 } from 'lucide-react';
import toast from "react-hot-toast";

export default function MarketingTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        whatsapp_number: settings.whatsapp_number || '',
        whatsapp_message: settings.whatsapp_message || 'Assalam o alaikum, I need help with...',
        affiliate_system: settings.affiliate_system || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ui-settings.store'), { onSuccess: () => toast.success('Marketing Settings Saved!') });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 border border-green-200">
                <MessageCircle className="text-green-600" />
                <h3 className="font-bold text-green-800">WhatsApp Marketing</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">WhatsApp Number</label>
                    <input type="text" value={data.whatsapp_number} onChange={e => setData('whatsapp_number', e.target.value)} className="w-full rounded-lg border-gray-300" placeholder="+923000000000" />
                </div>
                <div>
                    <label className="text-sm font-medium">Default Message</label>
                    <input type="text" value={data.whatsapp_message} onChange={e => setData('whatsapp_message', e.target.value)} className="w-full rounded-lg border-gray-300" />
                </div>
            </div>
            <div className="pt-4 border-t">
                <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3 border border-blue-200">
                    <Share2 className="text-blue-600" />
                    <h3 className="font-bold text-blue-800">Affiliate Program</h3>
                </div>
                <div className="mt-4">
                    <select value={data.affiliate_system} onChange={e => setData('affiliate_system', e.target.value)} className="w-full rounded-lg border-gray-300">
                        <option value="yes">Enable Affiliate System</option>
                        <option value="no">Disable Affiliate System</option>
                    </select>
                </div>
            </div>
            <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Marketing
            </button>
        </form>
    );
}