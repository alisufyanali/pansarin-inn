import { useForm } from '@inertiajs/react';
import { Save, CreditCard, ShieldCheck } from 'lucide-react';
import toast from "react-hot-toast";

export default function PaymentsTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        paypal_set: settings.paypal_set?.status || 'no',
        paypal_email: settings.paypal_email?.value || '',
        paypal_type: settings.paypal_type?.value || 'sandbox',
        stripe_set: settings.stripe_set?.status || 'no',
        stripe_publishable: settings.stripe_publishable?.value || '',
        stripe_secret: settings.stripe_secret?.value || '',
        cash_set: settings.cash_on_delivery?.status || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/payments', {
            preserveScroll: true,
            onSuccess: () => toast.success('Payment settings updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-10 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2"><CreditCard className="text-indigo-600" /> Payment Gateways</h3>

            {/* PayPal Section */}
            <div className={`p-6 rounded-3xl border-2 transition-all ${data.paypal_set === 'ok' ? 'border-blue-500 bg-blue-50/10' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-6">
                    <span className="font-black text-lg text-blue-800">PAYPAL</span>
                    <select value={data.paypal_set} onChange={e => setData('paypal_set', e.target.value)} className="rounded-xl border-gray-200 font-bold">
                        <option value="ok">Enabled</option>
                        <option value="no">Disabled</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" placeholder="PayPal Email" value={data.paypal_email} onChange={e => setData('paypal_email', e.target.value)} className="h-12 rounded-xl border-gray-200" />
                    <select value={data.paypal_type} onChange={e => setData('paypal_type', e.target.value)} className="h-12 rounded-xl border-gray-200">
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live</option>
                    </select>
                </div>
            </div>

            {/* Cash on Delivery Section */}
            <div className="flex items-center justify-between p-6 bg-green-50/30 border-2 border-green-100 rounded-3xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl shadow-sm"><ShieldCheck className="text-green-600" /></div>
                    <span className="font-bold">Cash on Delivery (COD)</span>
                </div>
                <select value={data.cash_set} onChange={e => setData('cash_set', e.target.value)} className="rounded-xl border-green-200 font-bold">
                    <option value="ok">Enabled</option>
                    <option value="no">Disabled</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE PAYMENTS'}
                </button>
            </div>
        </form>
    );
}