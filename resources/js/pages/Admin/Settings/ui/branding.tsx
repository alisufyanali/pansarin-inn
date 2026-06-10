import { useForm } from '@inertiajs/react';
import {
    ImageIcon,
    Palette,
    Save,
    ShieldCheck,
    Type,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BrandingTab({ settings }: { settings: any }) {
    const [previews, setPreviews] = useState({
    logo: settings.home_top_logo || settings.logo || null, // Database ki key ke mutabiq
    favicon: settings.fav_ext || settings.favicon || null,
    });

    const { data, setData, post, errors, processing } = useForm({
        section: 'branding',
        header_color: settings.header_color || '#27ae60',
        footer_color: settings.footer_color || '#1a1a1a',
        font: settings.font || 'Inter',
        // Yahan hum File object nahi rakh sakte refresh par, 
        // lekin hum isay null rakhenge taaki controller purana data overwrite na kare
        home_top_logo: null as File | null, 
        fav_ext: null as File | null,
    });

    const googleFonts = ['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato'];

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'home_top_logo' | 'fav_ext',
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file);
            setPreviews((prev) => ({
                ...prev,
                [field === 'home_top_logo' ? 'logo' : 'favicon']:
                    URL.createObjectURL(file),
            }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/ui/branding', {
            preserveScroll: true,
            onSuccess: () => toast.success('Branding & Assets Saved!'),
            onError: () => toast.error('Something went wrong!'),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="animate-in space-y-10 duration-500 fade-in"
        >
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800">
                <ShieldCheck className="h-6 w-6 text-indigo-600" /> Identity &
                Visual Branding
            </h3>

            {/* Colors & Fonts Row */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {/* Square Color Pickers */}
                <div className="space-y-6">
                    <label className="text-sm font-bold tracking-wider text-gray-500 uppercase">
                        Theme Colors
                    </label>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Header Color */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-gray-600">
                                Header Color
                            </span>
                            <div className="flex items-center gap-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm">
                                    <input
                                        type="color"
                                        value={data.header_color}
                                        onChange={(e) =>
                                            setData(
                                                'header_color',
                                                e.target.value,
                                            )
                                        }
                                        className="absolute -inset-2 h-[150%] w-[150%] cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm font-bold text-gray-800 uppercase">
                                        {data.header_color}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        Primary Theme
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Color */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-gray-600">
                                Footer Color
                            </span>
                            <div className="flex items-center gap-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm">
                                    <input
                                        type="color"
                                        value={data.footer_color}
                                        onChange={(e) =>
                                            setData(
                                                'footer_color',
                                                e.target.value,
                                            )
                                        }
                                        className="absolute -inset-2 h-[150%] w-[150%] cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm font-bold text-gray-800 uppercase">
                                        {data.footer_color}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        Secondary Theme
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Font Selection */}
                <div className="space-y-6">
                    <label className="text-sm font-bold tracking-wider text-gray-500 uppercase">
                        Typography
                    </label>
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold text-gray-600">
                            Site Font Family
                        </span>
                        <div className="relative">
                            <select
                                value={data.font}
                                onChange={(e) =>
                                    setData('font', e.target.value)
                                }
                                className="h-14 w-full appearance-none rounded-xl border-gray-300 pr-10 pl-4 shadow-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                {googleFonts.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                            <Type className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                        <p className="text-[11px] text-indigo-500 italic">
                            Preview: The quick brown fox jumps over the lazy
                            dog.
                        </p>
                    </div>
                </div>
            </div>

            {/* Logo & Favicon Section */}
            <div className="grid grid-cols-1 gap-10 border-t border-gray-100 pt-6 md:grid-cols-2">
                {/* Main Logo */}
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-500 uppercase">
                        <ImageIcon className="h-4 w-4" /> Header Logo
                    </label>
                    <div className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 p-8 transition-all hover:border-indigo-300">
                        {previews.logo ? (
                            <img
                                src={previews.logo}
                                alt="Logo"
                                className="max-h-28 object-contain drop-shadow-md"
                            />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto mb-2 h-10 w-10 text-indigo-300" />
                                <p className="text-sm font-medium text-indigo-400">
                                    Drop your logo here
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                handleFileChange(e, 'home_top_logo')
                            }
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                    </div>
                </div>

                {/* Favicon */}
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-500 uppercase">
                        <Palette className="h-4 w-4" /> Favicon
                    </label>
                    <div className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 p-8 transition-all hover:border-indigo-300">
                        {previews.favicon ? (
                            <img
                                src={previews.favicon}
                                alt="Favicon"
                                className="h-16 w-16 rounded-xl object-contain shadow-lg"
                            />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto mb-2 h-10 w-10 text-indigo-300" />
                                <p className="text-sm font-medium text-indigo-400">
                                    Select .png / .ico
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'fav_ext')}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE BRANDING'}
                </button>
            </div>
        </form>
    );
}
