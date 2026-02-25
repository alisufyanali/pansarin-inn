import { useForm } from '@inertiajs/react';
import { Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        email_theme_style: settings.email_theme_style || 'style_1',
        email_theme_style_2: settings.email_theme_style_2 || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/ui/email', {
            preserveScroll: true,
            onSuccess: () => toast.success('Email Template Saved!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
                <Mail className="h-5 w-5 text-indigo-500" /> Email Theme
                Configuration
            </h3>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                    Active Style
                </label>
                <select
                    value={data.email_theme_style}
                    onChange={(e) =>
                        setData('email_theme_style', e.target.value)
                    }
                    className="mb-4 w-full rounded-lg border-gray-300"
                >
                    <option value="style_1">Style 1</option>
                    <option value="style_2">Style 2 (Custom HTML)</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                    Email Body HTML (Style 2)
                </label>
                <textarea
                    value={data.email_theme_style_2}
                    onChange={(e) =>
                        setData('email_theme_style_2', e.target.value)
                    }
                    className="w-full rounded-lg border-gray-300 bg-gray-50 font-mono text-xs"
                    rows={12}
                    placeholder="<div style='...'>[[body]]</div>"
                />
                <p className="mt-1 text-[10px] text-blue-500 italic">
                    Note: Use [[body]] and [[logo]] as placeholders.
                </p>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE EMAIL TEMPLATE'}
                </button>
            </div>
        </form>
    );
}
