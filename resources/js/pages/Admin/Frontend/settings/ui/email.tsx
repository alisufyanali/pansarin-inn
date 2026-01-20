import { useForm } from '@inertiajs/react';
import { Save, Mail } from 'lucide-react';
import toast from "react-hot-toast";

export default function EmailTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        email_theme_style: settings.email_theme_style || 'style_1',
        email_theme_style_2: settings.email_theme_style_2 || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ui-settings.store'), { onSuccess: () => toast.success('Email Theme Saved!') });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-500" /> Email Theme Configuration</h3>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Active Style</label>
                <select value={data.email_theme_style} onChange={e => setData('email_theme_style', e.target.value)} className="w-full rounded-lg border-gray-300 mb-4">
                    <option value="style_1">Style 1</option>
                    <option value="style_2">Style 2 (Custom HTML)</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email Body HTML (Style 2)</label>
                <textarea 
                    value={data.email_theme_style_2} 
                    onChange={e => setData('email_theme_style_2', e.target.value)} 
                    className="w-full rounded-lg border-gray-300 font-mono text-xs bg-gray-50" 
                    rows={12}
                    placeholder="<div style='...'>[[body]]</div>"
                />
                <p className="text-[10px] text-blue-500 mt-1 italic">Note: Use [[body]] and [[logo]] as placeholders.</p>
            </div>
            <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Email Template
            </button>
        </form>
    );
}