import { useForm } from '@inertiajs/react';
import { Save, Phone, Mail, MapPin, Facebook, Instagram, Globe } from 'lucide-react';
import toast from "react-hot-toast";

export default function ContactTab({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        contact_address: settings.contact_address || '',
        contact_phone: settings.contact_phone || '',
        contact_email: settings.contact_email || '',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        footer_text: settings.footer_text || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post((window as any).route('admin.general-settings.updateContact'), {
            onSuccess: () => toast.success('Contact & Footer updated!'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold border-b pb-3 flex items-center gap-2 text-gray-800">
                <Phone className="w-6 h-6 text-indigo-600" /> Business Contact & Socials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email & Phone */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Support Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="email" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)} className="h-14 w-full pl-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} className="h-14 w-full pl-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Office Address</label>
                    <textarea value={data.contact_address} onChange={e => setData('contact_address', e.target.value)} className="h-[148px] w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm p-4 resize-none" placeholder="Enter physical store address..." />
                </div>
            </div>

            {/* Social Media Section */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook Page URL</label>
                    <input type="url" value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)} className="h-12 w-full rounded-xl border-gray-200 bg-gray-50" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram Profile URL</label>
                    <input type="url" value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)} className="h-12 w-full rounded-xl border-gray-200 bg-gray-50" />
                </div>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase">Footer Copyright Text</label>
                <input type="text" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)} className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="© 2026 Pansari Inn. All Rights Reserved." />
            </div>

            <div className="pt-4 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg transition-all active:scale-95">
                    <Save className="w-6 h-6" /> {processing ? 'SAVING...' : 'UPDATE CONTACT'}
                </button>
            </div>
        </form>
    );
}