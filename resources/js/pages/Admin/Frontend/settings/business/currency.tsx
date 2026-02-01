import { useForm } from '@inertiajs/react';
import { Save, Coins, Landmark, Hash, Type } from 'lucide-react';
import toast from "react-hot-toast";

export default function CurrencyTab({ settings }: { settings: any }) {
    // Controller se aane wala data settings.type.value ki surat mein hai
    const { data, setData, post, errors, processing } = useForm({
        currency_code: settings.currency_code?.value || 'PKR',
        currency_symbol: settings.currency_symbol?.value || 'Rs',
        currency_format: settings.currency_format?.value || 'left',
        no_of_decimals: settings.no_of_decimals?.value || '2',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/currency', {
            preserveScroll: true,
            onSuccess: () => toast.success('Currency configuration saved!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <Coins className="w-6 h-6 text-indigo-600" /> Currency & Pricing Format
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Currency Code */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Landmark className="w-4 h-4" /> Currency Code (ISO)
                    </label>
                    <input 
                        type="text" 
                        value={data.currency_code} 
                        onChange={e => setData('currency_code', e.target.value)} 
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                        placeholder="e.g. PKR, USD" 
                    />
                </div>

                {/* Currency Symbol */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Type className="w-4 h-4" /> Currency Symbol
                    </label>
                    <input 
                        type="text" 
                        value={data.currency_symbol} 
                        onChange={e => setData('currency_symbol', e.target.value)} 
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        placeholder="e.g. Rs, $" 
                    />
                </div>

                {/* Symbol Format */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Symbol Position</label>
                    <select 
                        value={data.currency_format} 
                        onChange={e => setData('currency_format', e.target.value)} 
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold transition-all shadow-sm"
                    >
                        <option value="left">Left (Symbol Amount) - Rs 1,000</option>
                        <option value="right">Right (Amount Symbol) - 1,000 Rs</option>
                        <option value="left_space">Left with Space - Rs 1,000</option>
                        <option value="right_space">Right with Space - 1,000 Rs</option>
                    </select>
                </div>

                {/* No. of Decimals */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Hash className="w-4 h-4" /> No. of Decimals
                    </label>
                    <input 
                        type="number" 
                        value={data.no_of_decimals} 
                        onChange={e => setData('no_of_decimals', e.target.value)} 
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        placeholder="e.g. 2" 
                    />
                </div>
            </div>

            {/* Preview Box */}
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-indigo-900">Format Preview</h4>
                    <p className="text-sm text-indigo-600">This is how your prices will appear to customers.</p>
                </div>
                <div className="text-2xl font-black text-indigo-700">
                    {data.currency_format.includes('left') ? `${data.currency_symbol}${data.currency_format.includes('space') ? ' ' : ''}1,250.00` : `1,250.00${data.currency_format.includes('space') ? ' ' : ''}${data.currency_symbol}`}
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE CURRENCY'}
                </button>
            </div>
        </form>
    );
}