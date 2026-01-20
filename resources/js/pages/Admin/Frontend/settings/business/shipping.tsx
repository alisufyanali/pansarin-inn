import { useForm } from '@inertiajs/react';
import { Save, Truck, Info } from 'lucide-react';
import toast from "react-hot-toast";

export default function ShippingTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        shipping_cost: settings.shipping_cost?.value || '0',
        shipping_set: settings.shipping_cost?.status || 'no',
        shipping_cost_type: settings.shipping_cost_type?.value || 'flat',
        shipment_info: settings.shipment_info?.value || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.business-settings.updateShipping'), {
            onSuccess: () => toast.success('Shipping settings updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2"><Truck className="text-indigo-600" /> Shipping Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold">Standard Shipping Cost (PKR)</label>
                    <input type="number" value={data.shipping_cost} onChange={e => setData('shipping_cost', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Shipping Status</label>
                    <select value={data.shipping_set} onChange={e => setData('shipping_set', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200 font-bold">
                        <option value="ok">Active</option>
                        <option value="no">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Shipment Information (HTML or Text)</label>
                <textarea value={data.shipment_info} onChange={e => setData('shipment_info', e.target.value)} className="w-full h-32 rounded-2xl border-gray-200 bg-gray-50 p-4" placeholder="Standard delivery takes 3-5 business days." />
            </div>

            <div className="pt-4 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2"><Save /> {processing ? 'SAVING...' : 'SAVE SHIPPING'}</button>
            </div>
        </form>
    );
}