import { useForm } from '@inertiajs/react';
import { Facebook, Instagram, Mail, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactTab({ settings }: { settings: any }) {
    const { data, setData, post, errors, processing } = useForm({
        contact_address: settings.contact_address || '',
        contact_phone: settings.contact_phone || '',
        contact_email: settings.contact_email || '',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        footer_text: settings.footer_text || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/general/contact', {
            preserveScroll: true,
            onSuccess: () => toast.success('Contact & Footer updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="animate-in space-y-8 duration-500 fade-in"
        >
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800">
                <Phone className="h-6 w-6 text-indigo-600" /> Business Contact &
                Socials
            </h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Email & Phone */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">
                            Support Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={data.contact_email}
                                onChange={(e) =>
                                    setData('contact_email', e.target.value)
                                }
                                className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 pl-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={data.contact_phone}
                                onChange={(e) =>
                                    setData('contact_phone', e.target.value)
                                }
                                className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 pl-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">
                        Office Address
                    </label>
                    <textarea
                        value={data.contact_address}
                        onChange={(e) =>
                            setData('contact_address', e.target.value)
                        }
                        className="h-[148px] w-full resize-none rounded-2xl border-gray-200 bg-gray-50/50 p-4 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter physical store address..."
                    />
                </div>
            </div>

            {/* Social Media Section */}
            <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                        Page URL
                    </label>
                    <input
                        type="url"
                        value={data.facebook_url}
                        onChange={(e) =>
                            setData('facebook_url', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200 bg-gray-50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Instagram className="h-4 w-4 text-pink-500" />{' '}
                        Instagram Profile URL
                    </label>
                    <input
                        type="url"
                        value={data.instagram_url}
                        onChange={(e) =>
                            setData('instagram_url', e.target.value)
                        }
                        className="h-12 w-full rounded-xl border-gray-200 bg-gray-50"
                    />
                </div>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase">
                    Footer Copyright Text
                </label>
                <input
                    type="text"
                    value={data.footer_text}
                    onChange={(e) => setData('footer_text', e.target.value)}
                    className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="© 2026 Pansari Inn. All Rights Reserved."
                />
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE CONTACT'}
                </button>
            </div>
        </form>
    );
}
