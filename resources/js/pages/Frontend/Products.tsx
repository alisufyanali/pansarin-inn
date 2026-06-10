import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

export default function Products({ products, categories, siteData }: any) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredProducts = selectedCategory === 'all' 
        ? products.data 
        : products.data.filter((p: any) => p.category_id === parseInt(selectedCategory));

    return (
        /* Sidebar hatane ke liye variant="full" ya similar prop use hota hai */
        <AppLayout breadcrumbs={[{ title: 'Products', href: '/products' }]}>
            <Head title="Products Catalog" />

            <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        Our Collection
                    </h1>
                    <p className="text-gray-500 max-w-2xl">
                        Premium quality pansari products sourced directly for your health and wellness.
                    </p>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('all')}
                        className="rounded-full px-8 shadow-sm transition-all"
                    >
                        All Items
                    </Button>
                    {categories?.map((cat: any) => (
                        <Button 
                            key={cat.id}
                            variant={selectedCategory == cat.id ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat.id.toString())}
                            className="rounded-full px-8 transition-all"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product: any) => (
                        <div 
                            key={product.id} 
                            className="group bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                            {/* Image Wrapper */}
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                                <img 
                                    src={product.thumbnail ? `/storage/${product.thumbnail}` : '/images/placeholder.png'} 
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {product.unit || 'Unit'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-4">
                                <div className="min-h-[60px]">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium font-urdu" dir="rtl">
                                        {product.urdu_name}
                                    </p>
                                </div>
                                
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-emerald-600">
                                        {siteData.business.currency}{Number(product.sale_price || product.price).toLocaleString()}
                                    </span>
                                    {product.sale_price && (
                                        <span className="text-sm text-gray-400 line-through font-medium">
                                            {siteData.business.currency}{Number(product.price).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-5 gap-2 pt-2">
                                    <Button asChild className="col-span-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-all">
                                        <Link href={route('frontend.product.detail', product.slug)}>
                                            <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild className="col-span-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                        <Link href={route('frontend.product.detail', product.slug)}>
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-gray-400 font-medium text-lg">Is category mein filhal koi products nahi hain.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}