import { useForm } from '@inertiajs/react';
import { BarChart3, Globe, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeoTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        meta_keywords: settings.meta_keywords || '',
        google_analytics_id: settings.google_analytics_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/seo', {
            preserveScroll: true,
            onSuccess: () => toast.success('SEO & Analytics updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="animate-in space-y-8 fade-in">
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800">
                <Globe className="h-6 w-6 text-indigo-600" /> SEO & Google
                Analytics
            </h3>

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Search className="h-4 w-4" /> Meta Title
                    </label>
                    <input
                        type="text"
                        value={data.meta_title}
                        onChange={(e) => setData('meta_title', e.target.value)}
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Pansari Inn | Organic Store & Natural Herbs"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Search className="h-4 w-4" /> Meta Keywords
                    </label>
                    <input
                        type="text"
                        value={data.meta_keywords}
                        onChange={(e) =>
                            setData('meta_keywords', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="organic, herbs, healthy, food (comma separated)"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Search className="h-4 w-4" /> Meta Description
                    </label>
                    <textarea
                        value={data.meta_description}
                        onChange={(e) =>
                            setData('meta_description', e.target.value)
                        }
                        className="h-32 w-full resize-none rounded-2xl border-gray-200 bg-gray-50/50 p-4 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Provide a brief summary of your shop for Google search results..."
                    />
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <BarChart3 className="h-4 w-4 text-red-500" /> Google
                        Analytics ID
                    </label>
                    <input
                        type="text"
                        value={data.google_analytics_id}
                        onChange={(e) =>
                            setData('google_analytics_id', e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE SEO'}
                </button>
            </div>
        </form>
    );
}
