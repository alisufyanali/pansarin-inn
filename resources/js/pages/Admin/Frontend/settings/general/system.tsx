import { useForm } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SystemTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        system_name: settings.system_name ?? '',
        system_title: settings.system_title ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/system', {
            preserveScroll: true,
            onSuccess: () => toast.success('System Settings Updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Settings className="text-indigo-600" /> System Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold">System Name</label>
                    <input
                        type="text"
                        value={data.system_name}
                        onChange={(e) => setData('system_name', e.target.value)}
                        className="h-12 w-full rounded-xl border-gray-200 bg-gray-50/50"
                    />
                    {errors.system_name && (
                        <p className="text-sm text-red-500">
                            {errors.system_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold">System Title</label>
                    <input
                        type="text"
                        value={data.system_title}
                        onChange={(e) =>
                            setData('system_title', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200 bg-gray-50/50"
                    />
                    {errors.system_title && (
                        <p className="text-sm text-red-500">
                            {errors.system_title}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'SAVE'}
                </button>
            </div>
        </form>
    );
}
