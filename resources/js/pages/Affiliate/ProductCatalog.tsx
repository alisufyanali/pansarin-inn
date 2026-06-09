import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Package, ExternalLink, Search, Tag } from 'lucide-react';
import toast from "react-hot-toast";

interface Product {
    id: number;
    name: string;
    slug: string;
    sale_price: number;
    commission_amount: number;
}

interface Props {
    products: Product[];
    affiliateCode: string;
    commissionRate: number;
}

export default function ProductCatalog({ products, affiliateCode, commissionRate }: Props) {

   const copyLink = (productSlug: string) => {
    const link = `${window.location.origin}/register-affiliate?ref=${affiliateCode}&product=${productSlug}`;
    navigator.clipboard.writeText(link);
    toast.success('Product promotion link copied!');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Product Catalog', href: '/affiliate/products' }]}>
            <Head title="Product Catalog" />

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                            <Package className="text-blue-600" size={32} /> 
                            Product Catalog
                        </h1>
                        <p className="text-gray-500 mt-1">Apne pasandida products promote karen aur commission kamayein.</p>
                    </div>
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-3">
                        <Tag size={20} />
                        <span className="font-bold">Your Rate: {commissionRate}%</span>
                    </div>
                </div>

                {/* Quick Search Placeholder (Aage ke liye) */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all dark:text-white"
                        disabled // Abhi disable hai, polish phase mein filter logic add karenge
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.length > 0 ? products.map((product) => (
                        <div key={product.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all flex flex-col group">
                            <div className="p-6 flex-1">
                                <h3 className="font-bold text-lg dark:text-white mb-4 line-clamp-2 min-h-[3.5rem]">
                                    {product.name}
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>Retail Price</span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-200">Rs.{product.sale_price}</span>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                        <div className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold mb-1">Your Earning</div>
                                        <div className="text-2xl font-black text-blue-700 dark:text-blue-500">
                                            Rs.{product.commission_amount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800">
                                <button 
                                    onClick={() => copyLink(product.slug)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-600 transition-all font-bold text-sm"
                                >
                                    <ExternalLink size={16} /> Copy Link
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            No products available in the catalog.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}