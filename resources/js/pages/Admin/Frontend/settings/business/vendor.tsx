import { useForm } from '@inertiajs/react';
import { Save, Users, Percent } from 'lucide-react';
import toast from "react-hot-toast";

export default function VendorTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        commission_set: settings.commission_set?.status || 'no',
        commission_amount: settings.commission_amount?.value || '0',
        vendor_vp_set: settings.vendor_vp_set?.status || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/vendor', {
            preserveScroll: true,
            onSuccess: () => toast.success('Vendor settings updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2"><Users className="text-indigo-600" /> Multi-Vendor & Commission</h3>
            
            <div className="p-8 rounded-3xl border-2 border-indigo-50 bg-indigo-50/10 space-y-6">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">Enable Admin Commission</span>
                    <select value={data.commission_set} onChange={e => setData('commission_set', e.target.value)} className="rounded-xl border-gray-200">
                        <option value="ok">Yes</option><option value="no">No</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2"><Percent className="w-4 h-4" /> Admin Commission (%)</label>
                    <input type="number" value={data.commission_amount} onChange={e => setData('commission_amount', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200" placeholder="e.g. 10" />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE VENDOR RULES'}
                </button>
            </div>
        </form>
    );
}