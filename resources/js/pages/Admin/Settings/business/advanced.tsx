import { useForm } from '@inertiajs/react';
import { Save, Zap, AlertTriangle } from 'lucide-react';
import toast from "react-hot-toast";

export default function AdvancedTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        order_cancellation_set: settings.order_cancellation?.status || 'disabled',
        coupon_system_set: settings.coupon_system?.status || 'disabled',
        business_debug: settings.business_debug?.status || 'inactive',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/advanced', {
            preserveScroll: true,
            onSuccess: () => toast.success('Advanced business rules saved!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    const ToggleRow = ({ label, value, field, description }: any) => (
        <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
            <div className="space-y-1">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <select 
                value={value} 
                onChange={e => setData(field, e.target.value)}
                className="h-11 rounded-xl border-gray-200 font-bold text-sm focus:ring-2 focus:ring-indigo-500"
            >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
            </select>
        </div>
    );

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2">
                <Zap className="text-indigo-600" /> Business Operations Control
            </h3>

            <div className="space-y-4">
                <ToggleRow 
                    label="Order Cancellation" 
                    description="Allow customers to cancel their orders before shipping."
                    value={data.order_cancellation_set}
                    field="order_cancellation_set"
                />
                <ToggleRow 
                    label="Coupon & Promo System" 
                    description="Enable or disable the global coupon/discount code system."
                    value={data.coupon_system_set}
                    field="coupon_system_set"
                />
                <div className="p-6 bg-red-50/30 rounded-3xl border border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg"><AlertTriangle className="text-red-500 w-5 h-5" /></div>
                        <div>
                            <p className="font-bold text-red-800">Operational Debug Mode</p>
                            <p className="text-xs text-red-600/70">Enable for transaction testing logs.</p>
                        </div>
                    </div>
                    <select 
                        value={data.business_debug} 
                        onChange={e => setData('business_debug', e.target.value)}
                        className="h-11 rounded-xl border-red-200 text-red-700 font-bold"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'APPLY ADVANCED RULES'}
                </button>
            </div>
        </form>
    );
}