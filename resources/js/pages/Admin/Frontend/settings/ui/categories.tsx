import { useForm } from '@inertiajs/react';
import { Layers, LayoutGrid, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
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
            toast.error('Invalid JSON format! Please check your syntax.');
            return;
        }

        post('/admin/settings/ui/categories', {
            preserveScroll: true,
            onSuccess: () => toast.success('Category Settings Saved!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
                <LayoutGrid className="h-5 w-5 text-indigo-500" /> Category &
                Slider Layout
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Category Slider
                    </label>
                    <select
                        value={data.category_slides}
                        onChange={(e) =>
                            setData('category_slides', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300 text-sm"
                    >
                        <option value="ok">Enabled (OK)</option>
                        <option value="no">Disabled</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Sidebar Position
                    </label>
                    <select
                        value={data.side_bar_pos_category}
                        onChange={(e) =>
                            setData('side_bar_pos_category', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300 text-sm"
                    >
                        <option value="left">Left Sidebar</option>
                        <option value="right">Right Sidebar</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Product Box Style
                    </label>
                    <select
                        value={data.category_product_box_style}
                        onChange={(e) =>
                            setData(
                                'category_product_box_style',
                                e.target.value,
                            )
                        }
                        className="w-full rounded-lg border-gray-300 text-sm"
                    >
                        <option value="1">Style 1</option>
                        <option value="2">Style 2</option>
                        <option value="3">Style 3</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6 border-t pt-6">
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                        <Layers className="h-4 w-4" /> Home Category Blocks
                        (JSON)
                    </label>
                    <textarea
                        value={data.home_categories}
                        onChange={(e) =>
                            setData('home_categories', e.target.value)
                        }
                        className="mt-2 w-full rounded-lg border-gray-300 bg-gray-50 p-4 font-mono text-xs"
                        rows={6}
                    />
                    {/* Fixed this line below: Wrapped brackets in quotes */}
                    <p className="mt-1 text-[10px] text-gray-400 italic">
                        Example Format:{' '}
                        {'[{"category":"ID", "sub_category":["ID1"]}]'}
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Top Slide Categories (IDs Array)
                    </label>
                    <input
                        type="text"
                        value={data.top_slide_categories}
                        onChange={(e) =>
                            setData('top_slide_categories', e.target.value)
                        }
                        className="mt-2 w-full rounded-lg border-gray-300 font-mono text-sm"
                        placeholder='["1", "2", "3"]'
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE CATEGORY LAYOUT'}
                </button>
            </div>
        </form>
    );
}
