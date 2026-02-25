import React from 'react';
import { Head } from '@inertiajs/react';
import { Globe, Facebook, Instagram, MapPin, Phone, Mail} from 'lucide-react';

interface SiteProps {
    siteData: {
        general: { name: string; title: string; contact_address: string; contact_phone: string; contact_email: string; facebook_url: string; instagram_url: string; footer_text: string;};
        business: { currency: string; paypal_enabled: boolean };
        ui: { header_color: string; footer_color: string; font: string; logo: string; favicon: string; };
    };
}

export default function Frontend({ siteData }: SiteProps) {
    const { general, business, ui } = siteData;

    return (
        // Font Family ko yahan inject kiya gaya hai
        <div className="min-h-screen p-8 transition-all duration-500" 
             style={{ backgroundColor: '#f9fafb', fontFamily: ui.font }}>
            
            <Head title={general.title}>
                {/* Favicon implementation */}
                {ui.favicon && <link rel="icon" type="image/x-icon" href={ui.favicon} />}
            </Head>

            {/* Header section */}
            <header className="mb-10 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between" 
                    style={{ backgroundColor: ui.header_color }}>
                <div>
                    {/* Logo display logic: Agar logo hai to image, varna text */}
                    {ui.logo ? (
                        <img src={ui.logo} alt={general.name} className="h-12 w-auto object-contain" />
                    ) : (
                        <h1 className="text-4xl font-extrabold">{general.name}</h1>
                    )}
                    <p className="opacity-90 mt-1">{general.title}</p>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Business Stats</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Default Currency:</span>
                            <span className="font-bold">{business.currency} 2,000</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">PayPal Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                business.paypal_enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {business.paypal_enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Visual Theme</h2>
                    <p className="text-gray-500 text-sm mb-2 font-semibold">Active Font: {ui.font}</p>
                    <div className="flex gap-4">
                        <code className="flex-1 p-2 rounded text-center font-mono text-xs text-white"
                              style={{ backgroundColor: ui.header_color}}>
                            Header: {ui.header_color}
                        </code>
                        <code className="flex-1 p-2 rounded text-center font-mono text-xs text-white"
                              style={{ backgroundColor: ui.footer_color}}>
                            Footer: {ui.footer_color}
                        </code>
                    </div>
                </div>
            </main>

            {/* Footer section */}
            <footer className="mt-20 p-8 md:p-12 rounded-t-[3rem] text-white shadow-2xl" 
                    style={{ backgroundColor: ui.footer_color}}>
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                             {/* Footer Logo Option */}
                             {ui.logo ? (
                                <img src={ui.favicon} alt="Logo" className="h-8 brightness-0 invert" />
                             ) : (
                                <><Globe className="w-6 h-6" /> {general.name}</>
                             )}
                        </h3>
                        <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                            {general.footer_text}
                        </p>
                        <div className="flex gap-4 pt-2">
                            {general.facebook_url && (
                                <a href={general.facebook_url} target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {general.instagram_url && (
                                <a href={general.instagram_url} target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider">Contact Us</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 opacity-90">
                                <MapPin className="w-5 h-5 text-indigo-300 shrink-0" />
                                <span className="text-sm">{general.contact_address}</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-90">
                                <Phone className="w-5 h-5 text-indigo-300 shrink-0" />
                                <span className="text-sm">{general.contact_phone}</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-90">
                                <Mail className="w-5 h-5 text-indigo-300 shrink-0" />
                                <span className="text-sm">{general.contact_email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider">Payment Methods</h4>
                        <div className="flex flex-wrap gap-2 opacity-80">
                            {business.paypal_enabled && <span className="px-3 py-1 bg-white/10 rounded-lg text-xs border border-white/10">PayPal</span>}
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs border border-white/10">Stripe</span>
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs border border-white/10">COD</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm opacity-60">
                    <p>© {new Date().getFullYear()} {general.name}. {general.footer_text}</p>
                </div>
            </footer>
        </div>
    );
}