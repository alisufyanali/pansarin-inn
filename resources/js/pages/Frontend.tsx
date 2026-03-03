import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Globe, Facebook, Instagram, MapPin, Phone, Mail, ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteProps {
    products: any;
    categories: any;
    siteData: {
        general: { name: string; title: string; contact_address: string; contact_phone: string; contact_email: string; facebook_url: string; instagram_url: string; footer_text: string;};
        business: { currency: string; paypal_enabled: boolean };
        ui: { header_color: string; footer_color: string; font: string; logo: string; favicon: string; };
    };
}

export default function Frontend({ products, categories, siteData }: SiteProps) {
    const { general, business, ui } = siteData;
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Filter Logic
    const filteredProducts = selectedCategory === 'all' 
    ? products?.data || [] 
    : products?.data?.filter((p: any) => p.category_id === parseInt(selectedCategory)) || [];

    return (
        <div className="min-h-screen transition-all duration-500 flex flex-col" 
             style={{ backgroundColor: '#f9fafb', fontFamily: ui.font }}>
            
            <Head title={general.title}>
                {ui.favicon && <link rel="icon" type="image/x-icon" href={ui.favicon} />}
            </Head>

            {/* Header section */}
            <header className="m-6 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between" 
                    style={{ backgroundColor: ui.header_color }}>
                <div>
                    {ui.logo ? (
                        <img src={ui.logo} alt={general.name} className="h-12 w-auto object-contain" />
                    ) : (
                        <h1 className="text-4xl font-black tracking-tighter">{general.name}</h1>
                    )}
                    <p className="opacity-90 mt-1 font-medium">{general.title}</p>
                </div>
                {/* Optional: Add Cart Icon or Login here */}
            </header>

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
                
                {/* Hero / Stats Section (Optional - kept your existing logic) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                        <h2 className="text-2xl font-black mb-4 text-gray-800">Premium Collection</h2>
                        <p className="text-gray-500">Discover our authentic organic products at {general.name}.</p>
                    </div>
                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tight">Store Info</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Currency:</span>
                                <span className="font-black text-blue-600">{business.currency}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Ordering:</span>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Open 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PRODUCTS SECTION START --- */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <h3 className="text-3xl font-black tracking-tighter text-gray-900">Featured Products</h3>
                        
                        {/* Categories Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <Button 
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('all')}
                                className="rounded-full px-6 shadow-sm font-bold"
                            >
                                All
                            </Button>
                            {categories?.map((cat: any) => (
                                <Button 
                                    key={cat.id}
                                    variant={selectedCategory == cat.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(cat.id.toString())}
                                    className="rounded-full px-6 font-bold"
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product: any) => (
                            <div key={product.id} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                                <div className="aspect-square relative overflow-hidden bg-gray-50">
                                    <img 
                                        src={product.thumbnail ? `/storage/${product.thumbnail}` : '/images/placeholder.png'} 
                                        alt={product.name}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                    />
                                                                        <img 
                                        src={product.thumbnail?.startsWith('http') 
                                            ? product.thumbnail 
                                            : `/storage/${product.thumbnail}`} 
                                        alt={product.name}
                                        className="..."
                                    />
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-gray-800 shadow-sm border border-white">
                                            {product.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h4>
                                        <p className="text-sm text-gray-400 font-urdu" dir="rtl">{product.urdu_name}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-blue-600">
                                            {business.currency}{Number(product.sale_price || product.price).toLocaleString()}
                                        </span>
                                        {product.sale_price && (
                                            <span className="text-xs text-gray-400 line-through font-bold opacity-60">
                                                {business.currency}{Number(product.price).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button asChild className="rounded-xl bg-gray-900 hover:bg-black text-white font-bold h-11">
                                            <Link href={route('frontend.product.detail', product.slug)}>
                                                <ShoppingCart className="w-4 h-4 mr-2" /> Buy
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild className="rounded-xl h-11 border-gray-200">
                                            <Link href={route('frontend.product.detail', product.slug)}>
                                                <Eye className="w-4 h-4 mr-2" /> View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                            No products found in this category.
                        </div>
                    )}
                </section>
                {/* --- PRODUCTS SECTION END --- */}

            </main>

            {/* Footer section */}
            <footer className="mt-20 p-8 md:p-16 rounded-t-[4rem] text-white shadow-2xl" 
                    style={{ backgroundColor: ui.footer_color}}>
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-black flex items-center gap-3">
                             {ui.logo ? (
                                <img src={ui.favicon} alt="Logo" className="h-10 brightness-0 invert" />
                             ) : (
                                <><Globe className="w-8 h-8" /> {general.name}</>
                             )}
                        </h3>
                        <p className="text-sm opacity-70 leading-relaxed font-medium">
                            {general.footer_text}
                        </p>
                        <div className="flex gap-4">
                            {general.facebook_url && (
                                <a href={general.facebook_url} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                    <Facebook className="w-6 h-6" />
                                </a>
                            )}
                            {general.instagram_url && (
                                <a href={general.instagram_url} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                    <Instagram className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tighter border-l-4 border-white/20 pl-4">Contact Info</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 opacity-80">
                                <MapPin className="w-6 h-6 text-white shrink-0" />
                                <span className="text-sm font-medium">{general.contact_address}</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-80">
                                <Phone className="w-6 h-6 text-white shrink-0" />
                                <span className="text-sm font-medium">{general.contact_phone}</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-80">
                                <Mail className="w-6 h-6 text-white shrink-0" />
                                <span className="text-sm font-medium">{general.contact_email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tighter border-l-4 border-white/20 pl-4">Trust & Payment</h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/10">CASH ON DELIVERY</span>
                            {business.paypal_enabled && <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/10">PAYPAL</span>}
                            <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/10">STRIKE SECURITY</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/10 text-center text-xs opacity-50 font-bold uppercase tracking-widest">
                    © {new Date().getFullYear()} {general.name} • All Rights Reserved
                </div>
            </footer>
        </div>
    );
}