import { useForm } from '@inertiajs/react';
import { Save, Home } from 'lucide-react';
import toast from "react-hot-toast";

export default function HomepageTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
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
        post(route('admin.ui-settings.store'), { onSuccess: () => toast.success('Homepage Updated!') });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Home className="w-5 h-5 text-indigo-500" /> Main Sections Visibility</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['featured_show', 'brand_show', 'blog_show', 'vandors_show'].map((field) => (
                    <div key={field}>
                        <label className="text-xs font-bold text-gray-500 uppercase">{field.replace('_', ' ')}</label>
                        <select value={data[field as keyof typeof data]} onChange={e => setData(field as any, e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
                            <option value="ok">Show</option>
                            <option value="no">Hide</option>
                        </select>
                    </div>
                ))}
            </div>
            <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Blog Section Title</label>
                        <input type="text" value={data.parallax_blog_title} onChange={e => setData('parallax_blog_title', e.target.value)} className="w-full rounded-lg border-gray-300" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Vendor Section Title</label>
                        <input type="text" value={data.parallax_vendor_title} onChange={e => setData('parallax_vendor_title', e.target.value)} className="w-full rounded-lg border-gray-300" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Marquee Text</label>
                    <textarea value={data.marquee_text} onChange={e => setData('marquee_text', e.target.value)} className="w-full rounded-lg border-gray-300" rows={3} />
                </div>
            </div>
            <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Homepage
            </button>
        </form>
    );
}