import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Copy, Share2, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import React, { useState } from 'react';

export default function ProductCatalog({ products, categories, affiliate_id }: any) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const copyAffiliateLink = (slug: string) => {
        const url = `${window.location.origin}/products/${slug}?ref=${affiliate_id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied! Ab aap isay share kar sakte hain.");
    };

    // Filter products based on category
    const filteredProducts = selectedCategory === 'all' 
        ? products.data 
        : products.data.filter((p: any) => p.category_id === parseInt(selectedCategory));

    return (
        <AppLayout breadcrumbs={[{ title: 'Product Catalog', href: '#' }]}>
            <Head title="Marketing Kit" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight">Marketing Kit</h1>
                    <p className="text-gray-500 text-sm">Apne pasandida products select karen aur unke affiliate links share karen.</p>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('all')}
                        className="rounded-full px-6"
                    >
                        All Products
                    </Button>
                    {categories.map((cat: any) => (
                        <Button 
                            key={cat.id}
                            variant={selectedCategory == cat.id ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat.id.toString())}
                            className="rounded-full px-6"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product: any) => (
                        <div key={product.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Product Image */}
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                                <img 
                                    src={product.thumbnail ? `/storage/${product.thumbnail}` : '/images/placeholder.png'} 
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="bg-white/90 dark:bg-black/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                        {product.category?.name}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-3">
    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
    
    <div className="flex items-center justify-between">
        <span className="text-xl font-black text-gray-900 dark:text-white">
            Rs. {Number(product.sale_price).toLocaleString()}
        </span>
        {/* Commission Percentage Badge */}
        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
            {Number(product.affiliate_commission)}% Commission
        </div>
    </div>
    
    {/* Earning Calculation Box */}
    <div className="bg-emerald-600 rounded-xl p-3 text-white flex justify-between items-center shadow-sm shadow-emerald-200">
        <div className="flex flex-col">
            <span className="text-[10px] opacity-80 font-medium">Your Profit</span>
            <span className="text-lg font-black leading-none">
                Rs. {Number(product.commission_amount).toLocaleString()}
            </span>
        </div>
        <Tag className="w-5 h-5 opacity-50" />
    </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        onClick={() => copyAffiliateLink(product.slug)}
                                        variant="outline" 
                                        className="w-full text-xs font-bold"
                                    >
                                        <Copy className="w-3 h-3 mr-2" /> Link
                                    </Button>
                                    <Button 
                                        className="w-full text-xs font-bold bg-gray-900 hover:bg-black text-white"
                                        onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                                    >
                                        <ExternalLink className="w-3 h-3 mr-2" /> View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500">Is category mein koi products nahi hain.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}