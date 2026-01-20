import { useForm } from '@inertiajs/react';
import { Save, LayoutGrid, Layers } from 'lucide-react';
import toast from "react-hot-toast";

export default function CategoriesTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        category_slides: settings.category_slides || 'ok',
        side_bar_pos_category: settings.side_bar_pos_category || 'right',
        category_product_box_style: settings.category_product_box_style || '2',
        home_categories: settings.home_categories || '[]',
        top_slide_categories: settings.top_slide_categories || '[]',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            JSON.parse(data.home_categories);
            JSON.parse(data.top_slide_categories);
        } catch (error) {
            toast.error("Invalid JSON format! Please check your syntax.");
            return;
        }

        post(route('admin.ui-settings.store'), { 
            onSuccess: () => toast.success('Category Settings Saved!') 
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-500" /> Category & Slider Layout
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Category Slider</label>
                    <select value={data.category_slides} onChange={e => setData('category_slides', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
                        <option value="ok">Enabled (OK)</option>
                        <option value="no">Disabled</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Sidebar Position</label>
                    <select value={data.side_bar_pos_category} onChange={e => setData('side_bar_pos_category', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
                        <option value="left">Left Sidebar</option>
                        <option value="right">Right Sidebar</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Product Box Style</label>
                    <select value={data.category_product_box_style} onChange={e => setData('category_product_box_style', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
                        <option value="1">Style 1</option>
                        <option value="2">Style 2</option>
                        <option value="3">Style 3</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 border-t space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Home Category Blocks (JSON)
                    </label>
                    <textarea 
                        value={data.home_categories} 
                        onChange={e => setData('home_categories', e.target.value)} 
                        className="w-full mt-2 rounded-lg border-gray-300 font-mono text-xs bg-gray-50 p-4" 
                        rows={6}
                    />
                    {/* Fixed this line below: Wrapped brackets in quotes */}
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                        Example Format: {"[{\"category\":\"ID\", \"sub_category\":[\"ID1\"]}]"}
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Top Slide Categories (IDs Array)</label>
                    <input 
                        type="text"
                        value={data.top_slide_categories} 
                        onChange={e => setData('top_slide_categories', e.target.value)} 
                        className="w-full mt-2 rounded-lg border-gray-300 font-mono text-sm"
                        placeholder='["1", "2", "3"]'
                    />
                </div>
            </div>

            <button disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                <Save className="w-5 h-5" /> {processing ? 'Processing...' : 'Save Category Layout'}
            </button>
        </form>
    );
}