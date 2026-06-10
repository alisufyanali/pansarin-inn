import { useForm } from '@inertiajs/react';
import { Home, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomepageTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        featured_show: settings.featured_show || 'ok',
        brand_show: settings.brand_show || 'ok',
        blog_show: settings.blog_show || 'ok',
        vandors_show: settings.vandors_show || 'ok',
        marquee_text: settings.marquee_text || '',
        parallax_blog_title: settings.parallax_blog_title || 'LATEST BLOGS',
        parallax_vendor_title: settings.parallax_vendor_title || 'OUR VENDOR',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/ui/homepage', {
            preserveScroll: true,
            onSuccess: () => toast.success('Homepage Updated!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
                <Home className="h-5 w-5 text-indigo-500" /> Main Sections
                Visibility
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    'featured_show',
                    'brand_show',
                    'blog_show',
                    'vandors_show',
                ].map((field) => (
                    <div key={field}>
                        <label className="text-xs font-bold text-gray-500 uppercase">
                            {field.replace('_', ' ')}
                        </label>
                        <select
                            value={data[field as keyof typeof data]}
                            onChange={(e) =>
                                setData(field as any, e.target.value)
                            }
                            className="w-full rounded-lg border-gray-300 text-sm"
                        >
                            <option value="ok">Show</option>
                            <option value="no">Hide</option>
                        </select>
                    </div>
                ))}
            </div>
            <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">
                            Blog Section Title
                        </label>
                        <input
                            type="text"
                            value={data.parallax_blog_title}
                            onChange={(e) =>
                                setData('parallax_blog_title', e.target.value)
                            }
                            className="w-full rounded-lg border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">
                            Vendor Section Title
                        </label>
                        <input
                            type="text"
                            value={data.parallax_vendor_title}
                            onChange={(e) =>
                                setData('parallax_vendor_title', e.target.value)
                            }
                            className="w-full rounded-lg border-gray-300"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                        Marquee Text
                    </label>
                    <textarea
                        value={data.marquee_text}
                        onChange={(e) =>
                            setData('marquee_text', e.target.value)
                        }
                        className="w-full rounded-lg border-gray-300"
                        rows={3}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE HOMEPAGE SETTINGS'}
                </button>
            </div>
        </form>
    );
}
