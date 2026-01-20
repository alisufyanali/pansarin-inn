import { useForm } from '@inertiajs/react';
import { Save, ShoppingBag } from 'lucide-react';
import toast from "react-hot-toast";

export default function ProductsTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        no_of_featured_products: settings.no_of_featured_products || '6',
        no_of_deal_products: settings.no_of_deal_products || '8',
        featured_product_box_style: settings.featured_product_box_style || '1',
        special_products_show: settings.special_products_show || 'ok',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ui-settings.store'), { onSuccess: () => toast.success('Product Settings Saved!') });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-indigo-500" /> Product Display & Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Featured Products Count</label>
                    <input type="number" value={data.no_of_featured_products} onChange={e => setData('no_of_featured_products', e.target.value)} className="w-full rounded-lg border-gray-300" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Todays Deal Count</label>
                    <input type="number" value={data.no_of_deal_products} onChange={e => setData('no_of_deal_products', e.target.value)} className="w-full rounded-lg border-gray-300" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Featured Box Style</label>
                    <select value={data.featured_product_box_style} onChange={e => setData('featured_product_box_style', e.target.value)} className="w-full rounded-lg border-gray-300">
                        <option value="1">Style 1 (Standard)</option>
                        <option value="2">Style 2 (Modern)</option>
                        <option value="3">Style 3 (Compact)</option>
                    </select>
                </div>
            </div>
            <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Product Settings
            </button>
        </form>
    );
}