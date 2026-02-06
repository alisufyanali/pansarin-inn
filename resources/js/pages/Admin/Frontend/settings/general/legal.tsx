import { useForm } from '@inertiajs/react';
import { FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LegalTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        terms_and_conditions: settings.terms_and_conditions || '',
        privacy_policy: settings.privacy_policy || '',
        return_policy: settings.return_policy || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/legal', {
            preserveScroll: true,
            onSuccess: () => toast.success('Legal pages updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="text-indigo-600" /> Legal & Policies
            </h3>
            {['terms_and_conditions', 'privacy_policy', 'return_policy'].map(
                (field) => (
                    <div key={field} className="space-y-2">
                        <label className="text-sm font-bold uppercase">
                            {field.replace(/_/g, ' ')}
                        </label>
                        <textarea
                            value={(data as any)[field]}
                            onChange={(e) =>
                                setData(field as any, e.target.value)
                            }
                            className="h-40 w-full rounded-xl border-gray-200 p-4"
                        />
                    </div>
                ),
            )}

            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE CONTENT'}
                </button>
            </div>
        </form>
    );
}
