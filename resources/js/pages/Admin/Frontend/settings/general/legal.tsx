import { useForm } from '@inertiajs/react';
import { Save, FileText } from 'lucide-react';
import toast from "react-hot-toast";

export default function LegalTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        terms_and_conditions: settings.terms_and_conditions || '',
        privacy_policy: settings.privacy_policy || '',
        return_policy: settings.return_policy || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateLegal'), {
            onSuccess: () => toast.success('Legal pages updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-indigo-600" /> Legal & Policies</h3>
            {['terms_and_conditions', 'privacy_policy', 'return_policy'].map((field) => (
                <div key={field} className="space-y-2">
                    <label className="text-sm font-bold uppercase">{field.replace(/_/g, ' ')}</label>
                    <textarea 
                        value={(data as any)[field]} 
                        onChange={e => setData(field as any, e.target.value)} 
                        className="w-full h-40 rounded-xl border-gray-200 p-4"
                    />
                </div>
            ))}
            <div className="flex justify-end"><button disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save Content</button></div>
        </form>
    );
}