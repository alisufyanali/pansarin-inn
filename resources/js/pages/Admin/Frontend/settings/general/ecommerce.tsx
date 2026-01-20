import { useForm } from '@inertiajs/react';
import { Save, ShoppingBag, Users, Wallet, Truck } from 'lucide-react';
import toast from "react-hot-toast";

export default function EcommerceTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        vendor_system: settings.vendor_system || 'no',
        wallet_system: settings.wallet_system || 'no',
        guest_checkout: settings.guest_checkout || 'yes',
        digital_product: settings.digital_product || 'no',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateEcommerce'), {
            onSuccess: () => toast.success('Ecommerce settings updated!')
        });
    };

    const ToggleField = ({ label, field, icon: Icon }: any) => (
        <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                    <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-700">{label}</span>
            </div>
            <select 
                value={data[field as keyof typeof data]} 
                onChange={e => setData(field as any, e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            >
                <option value="yes">ENABLED</option>
                <option value="no">DISABLED</option>
            </select>
        </div>
    );

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <ShoppingBag className="w-6 h-6 text-indigo-600" /> Ecommerce Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ToggleField label="Multi-Vendor System" field="vendor_system" icon={Users} />
                <ToggleField label="Customer Wallet System" field="wallet_system" icon={Wallet} />
                <ToggleField label="Allow Guest Checkout" field="guest_checkout" icon={Truck} />
                <ToggleField label="Digital Products Support" field="digital_product" icon={ShoppingBag} />
            </div>

            <div className="pt-6 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg transition-all active:scale-95">
                    <Save className="w-6 h-6" /> {processing ? 'SAVING...' : 'UPDATE ECOMMERCE'}
                </button>
            </div>
        </form>
    );
}