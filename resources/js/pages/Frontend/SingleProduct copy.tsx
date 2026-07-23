import React, { useCallback, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Globe, Facebook, Instagram, ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types matching the actual API response shape ─────────────────────────────
interface ApiReview {
    id: number;
    customer_name: string;
    rating: number;
    comment: string;
    is_verified: boolean;
    created_at: string;
}

interface ReviewStats {
    total: number;
    average: number;
    breakdown: Record<number, number>;
}

interface ReviewsApiData {
    stats: ReviewStats;
    reviews: ApiReview[];
}

interface ReviewsApiResponse {
    success: boolean;
    data: ReviewsApiData;
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

// ── Local display type ────────────────────────────────────────────────────────
interface Review {
    id: number;
    author: string;
    rating: number;
    body: string;
    verified: boolean;
    date: string;
}

function apiReviewToReview(r: ApiReview): Review {
    return {
        id: r.id,
        author: r.customer_name,
        rating: r.rating,
        body: r.comment,
        verified: r.is_verified,
        date: r.created_at,
    };
}

// ── Star renderer ─────────────────────────────────────────────────────────────
function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );
}

interface SingleProductProps {
    product: any;
    relatedProducts: any;
    siteData: {
        general: { name: string; title: string; contact_address: string; contact_phone: string; contact_email: string; facebook_url: string; instagram_url: string; footer_text: string;};
        business: { currency: string; paypal_enabled: boolean };
        ui: { header_color: string; footer_color: string; font: string; logo: string; favicon: string; };
    };
}

export default function SingleProduct({ product, relatedProducts, siteData }: SingleProductProps) {
    const { general, business, ui } = siteData;
    const [mainImage, setMainImage] = useState(product.thumbnail);
    const gallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : (product.gallery || []);

    // ── Reviews tab state ─────────────────────────────────────────────────────
    const [activeTab, setActiveTab]   = useState<'description' | 'reviews'>('description');
    const [reviews, setReviews]       = useState<Review[]>([]);
    const [stats, setStats]           = useState<ReviewStats | null>(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError]     = useState<string | null>(null);
    const [reviewsFetched, setReviewsFetched] = useState(false);

    const fetchReviews = useCallback(() => {
        if (reviewsFetched) return; // Only fetch once
        setReviewsLoading(true);
        setReviewsError(null);

        window.axios
            .get<ReviewsApiResponse>(`/api/products/${product.slug}/reviews`)
            .then((res) => {
                const payload = res.data;

                // Defensive: ensure shape matches before mapping
                const rawReviews = payload?.data?.reviews;
                if (Array.isArray(rawReviews)) {
                    setReviews(rawReviews.map(apiReviewToReview));
                } else {
                    console.warn('[Reviews] Unexpected response shape — data.reviews is not an array:', payload);
                    setReviews([]);
                }

                if (payload?.data?.stats) {
                    setStats(payload.data.stats);
                }
                setReviewsFetched(true);
            })
            .catch((err) => {
                console.error('[Reviews] Fetch failed:', err);
                setReviewsError('Could not load reviews. Please try again.');
            })
            .finally(() => {
                setReviewsLoading(false);
            });
    }, [product.slug, reviewsFetched]);

    // Fetch when the reviews tab is opened
    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab, fetchReviews]);

    return (
        <div className="min-h-screen transition-all duration-500 flex flex-col" 
             style={{ backgroundColor: '#f9fafb', fontFamily: ui.font }}>
            
            <Head title={`${product.name} - ${general.name}`}>
                {ui.favicon && <link rel="icon" type="image/x-icon" href={ui.favicon} />}
            </Head>

            {/* Header (Same as Frontend.tsx) */}
            <header className="m-6 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between" 
                    style={{ backgroundColor: ui.header_color }}>
                <Link href={route('frontend.home')}>
                    {ui.logo ? (
                        <img src={ui.logo} alt={general.name} className="h-12 w-auto object-contain" />
                    ) : (
                        <h1 className="text-4xl font-black tracking-tighter">{general.name}</h1>
                    )}
                </Link>
                <Link href={route('frontend.home')} className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full font-bold transition-all text-sm">
                    Back to Shop
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
                
                {/* Product Detail Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    
                    {/* Left: Images */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100">
                            <img 
                                src={`/storage/${mainImage}`} 
                                className="w-full h-full object-cover" 
                                alt={product.name} 
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[product.thumbnail, ...gallery].map((img: any, i: number) => (
                                <button 
                                    key={i} 
                                    onClick={() => setMainImage(img)}
                                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? 'border-blue-600 scale-95' : 'border-transparent opacity-60'}`}
                                >
                                    <img src={`/storage/${img}`} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-3xl font-medium text-gray-400 font-urdu" dir="rtl">
                                {product.urdu_name}
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black text-blue-600">
                                    {business.currency}{Number(product.sale_price || product.price).toLocaleString()}
                                </span>
                                {product.sale_price && (
                                    <span className="text-xl text-gray-300 line-through font-bold">
                                        {business.currency}{Number(product.price).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-blue text-gray-500 font-medium">
                            <p>{product.short_description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-700">100% Organic</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Truck className="text-blue-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-700">Fast Delivery</span>
                            </div>
                        </div>

                        <Button className="w-full h-16 rounded-2xl bg-gray-900 hover:bg-black text-white text-xl font-black shadow-xl transition-all hover:-translate-y-1">
                            <ShoppingCart className="mr-3" /> Add To Cart
                        </Button>
                    </div>
                </div>

                {/* Tabs: Description / Reviews */}
                <div className="mt-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-10 py-5 text-sm font-black uppercase tracking-widest transition-all ${
                                activeTab === 'description'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-10 py-5 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                activeTab === 'reviews'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            Reviews
                            {stats && (
                                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {stats.total}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Description panel */}
                    {activeTab === 'description' && (
                        <div className="p-12 space-y-6">
                            <h3 className="text-2xl font-black tracking-tight border-l-4 border-blue-600 pl-4">
                                Product Description
                            </h3>
                            <div
                                className="text-gray-600 leading-loose font-medium"
                                dangerouslySetInnerHTML={{ __html: product.long_description }}
                            />
                        </div>
                    )}

                    {/* Reviews panel */}
                    {activeTab === 'reviews' && (
                        <div className="p-8 md:p-12 space-y-8">
                            {/* Loading */}
                            {reviewsLoading && (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Error */}
                            {reviewsError && !reviewsLoading && (
                                <div className="text-center py-12 text-red-500 font-medium">
                                    {reviewsError}
                                    <button
                                        onClick={() => { setReviewsFetched(false); fetchReviews(); }}
                                        className="ml-3 underline text-blue-600"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Stats summary */}
                            {!reviewsLoading && !reviewsError && stats && stats.total > 0 && (
                                <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-3xl">
                                    <div className="flex flex-col items-center justify-center min-w-[140px] gap-2">
                                        <span className="text-6xl font-black text-gray-900">
                                            {stats.average.toFixed(1)}
                                        </span>
                                        <StarRow rating={Math.round(stats.average)} />
                                        <span className="text-sm text-gray-400 font-medium">
                                            {stats.total} review{stats.total !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {([5, 4, 3, 2, 1] as const).map((star) => {
                                            const count = stats.breakdown[star] ?? 0;
                                            const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-3 text-sm">
                                                    <span className="w-4 text-gray-500 font-bold text-right">{star}</span>
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-8 text-gray-400 font-medium">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Individual reviews */}
                            {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border border-gray-100 rounded-3xl p-6 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-gray-900">{review.author}</span>
                                                        {review.verified && (
                                                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                                                                Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <StarRow rating={review.rating} />
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium flex-shrink-0">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium">{review.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                                <div className="text-center py-16 text-gray-400 font-medium">
                                    No reviews yet. Be the first to review this product!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 space-y-8">
                        <h3 className="text-3xl font-black tracking-tighter text-gray-900 text-center">Related Products</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p: any) => (
                                <Link key={p.id} href={route('frontend.product.detail', p.slug)} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                        <img src={`/storage/${p.thumbnail}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={p.name} />
                                    </div>
                                    <div className="p-5 text-center">
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                                        <p className="text-blue-600 font-black mt-2">{business.currency}{Number(p.sale_price || p.price).toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Footer (Same as Frontend.tsx) */}
            <footer className="mt-20 p-8 md:p-16 rounded-t-[4rem] text-white shadow-2xl" 
                    style={{ backgroundColor: ui.footer_color}}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-black flex items-center justify-center md:justify-start gap-3">
                             {ui.logo ? (
                                <img src={ui.favicon} alt="Logo" className="h-10 brightness-0 invert" />
                             ) : (
                                <><Globe className="w-8 h-8" /> {general.name}</>
                             )}
                        </h3>
                        <p className="text-sm opacity-70 leading-relaxed font-medium">{general.footer_text}</p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tighter">Contact</h4>
                        <div className="space-y-3 opacity-80 text-sm font-medium">
                            <p>{general.contact_address}</p>
                            <p>{general.contact_phone}</p>
                            <p>{general.contact_email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-tighter">Social Links</h4>
                        <div className="flex justify-center md:justify-start gap-4">
                            {general.facebook_url && <a href={general.facebook_url} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><Facebook /></a>}
                            {general.instagram_url && <a href={general.instagram_url} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><Instagram /></a>}
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/10 text-center text-xs opacity-50 font-bold uppercase tracking-widest">
                    © {new Date().getFullYear()} {general.name}
                </div>
            </footer>
        </div>
    );
}