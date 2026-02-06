import { useForm } from '@inertiajs/react';
import { MessageCircle, Save, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketingTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        whatsapp_number: settings.whatsapp_number || '',
        whatsapp_message: settings.whatsapp_message ||'',
        affiliate_system: settings.affiliate_system || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/ui/marketing', {
            preserveScroll: true,
            onSuccess: () => toast.success('Marketing Settings Saved!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <MessageCircle className="text-green-600" />
                <h3 className="font-bold text-green-800">WhatsApp Marketing</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">
                        WhatsApp Number
                    </label>
                    <input
                        type="text"
                        value={data.whatsapp_number}
                        onChange={(e) =>
                            setData('whatsapp_number', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                        placeholder="+923000000000"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">
                        Default Message
                    </label>
                    <input
                        type="text"
                        value={data.whatsapp_message}
                        onChange={(e) =>
                            setData('whatsapp_message', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                    />
                </div>
            </div>
            <div className="border-t pt-4">
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Share2 className="text-blue-600" />
                    <h3 className="font-bold text-blue-800">
                        Affiliate Program
                    </h3>
                </div>
                <div className="mt-4">
                    <select
                        value={data.affiliate_system}
                        onChange={(e) =>
                            setData('affiliate_system', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                    >
                        <option value="yes">Enable Affiliate System</option>
                        <option value="no">Disable Affiliate System</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE MERKETING SETTINGS'}
                </button>
            </div>
        </form>
    );
}
