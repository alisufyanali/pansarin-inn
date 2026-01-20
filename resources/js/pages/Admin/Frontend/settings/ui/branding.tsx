import { useForm } from '@inertiajs/react';
import { Save, Palette, Type, ImageIcon, ShieldCheck, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from "react-hot-toast";

export default function BrandingTab({ settings }: { settings: any }) {
    const [previews, setPreviews] = useState({
        logo: settings.home_top_logo_url || null,
        favicon: settings.fav_ext_url || null
    });

    const { data, setData, post, processing } = useForm({
        section: 'branding',
        header_color: settings.header_color || '#27ae60',
        footer_color: settings.footer_color || '#1a1a1a',
        font: settings.font || 'Inter',
        home_top_logo: null as File | null, 
        fav_ext: null as File | null,
    });

    const googleFonts = ["Inter", "Roboto", "Poppins", "Open Sans", "Lato"];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'home_top_logo' | 'fav_ext') => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file);
            setPreviews(prev => ({ ...prev, [field === 'home_top_logo' ? 'logo' : 'favicon']: URL.createObjectURL(file) }));
        }
    };

    const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post((window as any).route('admin.ui-settings.store'), { 
        forceFormData: true,
        onSuccess: (page) => {
            console.log("Success!", page);
            toast.success('Branding & Assets Saved!');
        },
        onError: (errors) => {
            console.log("Errors:", errors);
            toast.error("Validation failed!");
        }
    });
};

    return (
        <form onSubmit={submit} className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <ShieldCheck className="w-6 h-6 text-indigo-600" /> Identity & Visual Branding
            </h3>

            {/* Colors & Fonts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Square Color Pickers */}
                <div className="space-y-6">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Theme Colors</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Header Color */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-gray-600">Header Color</span>
                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm">
                                    <input 
                                        type="color" 
                                        value={data.header_color} 
                                        onChange={e => setData('header_color', e.target.value)} 
                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-mono font-bold uppercase text-gray-800">{data.header_color}</span>
                                    <span className="text-[10px] text-gray-400">Primary Theme</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Color */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-gray-600">Footer Color</span>
                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm">
                                    <input 
                                        type="color" 
                                        value={data.footer_color} 
                                        onChange={e => setData('footer_color', e.target.value)} 
                                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-mono font-bold uppercase text-gray-800">{data.footer_color}</span>
                                    <span className="text-[10px] text-gray-400">Secondary Theme</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Font Selection */}
                <div className="space-y-6">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold text-gray-600">Site Font Family</span>
                        <div className="relative">
                            <select 
                                value={data.font} 
                                onChange={e => setData('font', e.target.value)} 
                                className="w-full h-14 rounded-xl border-gray-300 shadow-sm pl-4 pr-10 focus:ring-2 focus:ring-indigo-500 appearance-none"
                            >
                                {googleFonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <Type className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-indigo-500 italic">Preview: The quick brown fox jumps over the lazy dog.</p>
                    </div>
                </div>
            </div>

            {/* Logo & Favicon Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-gray-100">
                {/* Main Logo */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Header Logo
                    </label>
                    <div className="relative group border-2 border-dashed border-indigo-100 rounded-3xl p-8 bg-indigo-50/30 flex flex-col items-center justify-center min-h-[180px] hover:border-indigo-300 transition-all cursor-pointer">
                        {previews.logo ? (
                            <img src={previews.logo} alt="Logo" className="max-h-28 object-contain drop-shadow-md" />
                        ) : (
                            <div className="text-center">
                                <Upload className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-indigo-400">Drop your logo here</p>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'home_top_logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>

                {/* Favicon */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Favicon
                    </label>
                    <div className="relative group border-2 border-dashed border-indigo-100 rounded-3xl p-8 bg-indigo-50/30 flex flex-col items-center justify-center min-h-[180px] hover:border-indigo-300 transition-all cursor-pointer">
                        {previews.favicon ? (
                            <img src={previews.favicon} alt="Favicon" className="w-16 h-16 object-contain rounded-xl shadow-lg" />
                        ) : (
                            <div className="text-center">
                                <Upload className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-indigo-400">Select .png / .ico</p>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'fav_ext')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button 
                    disabled={processing} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:bg-gray-400"
                >
                    <Save className="w-6 h-6" /> {processing ? 'SAVING...' : 'UPDATE BRANDING'}
                </button>
            </div>
        </form>
    );
}