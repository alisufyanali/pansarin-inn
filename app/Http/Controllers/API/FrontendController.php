<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessSetting;
use App\Models\GeneralSetting;
use App\Models\UiSetting;
use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class FrontendController extends Controller
{
    // Settings fetch karne ke liye common method (code clean karne ke liye)
    private function getSiteSettings()
    {
        $general = GeneralSetting::all()->keyBy('type');
        $business = BusinessSetting::all()->keyBy('type');
        $ui = UiSetting::all()->keyBy('type');

        return [
            'general' => [
                'name'  => $general['system_name']->value ?? 'Pansari Inn',
                'title' => $general['system_title']->value ?? 'Welcome',
                'contact_address' => $general['contact_address']->value ?? '',
                'contact_phone' => $general['contact_phone']->value ?? '',
                'contact_email' => $general['contact_email']->value ?? '',
                'facebook_url' => $general['facebook_url']->value ?? '#',
                'instagram_url' => $general['instagram_url']->value ?? '#',
                'footer_text' => $general['footer_text']->value ?? '',
            ],
            'business' => [
                'currency' => $business['currency_symbol']->value ?? 'Rs.',
                'paypal_enabled' => ($business['paypal_set']->status ?? 'no') === 'ok',
            ],
            'ui' => [
                'header_color' => $ui['header_color']->value ??  '#4f46e5',
                'footer_color' => $ui['footer_color']->value ?? '#4f46e5',
                'font'         => $ui['font']->value ?? 'Inter',
                'logo'         => $ui['home_top_logo']->value ?? null,
                'favicon'      => $ui['fav_ext']->value ?? null,
            ]
        ];
    }

    // public function index()
    // {
    //     // return Inertia::render('Frontend', [
    //     //     'siteData' => $this->getSiteSettings(),
    //     //     'featuredProducts' => Product::where('status', true)->where('featured', true)->take(8)->get()
    //     // ]);

    //     return Inertia::render('Frontend', [
    //     'products'   => Product::where('status', true)->latest()->get(),
    //     'categories' => Category::all(),
    //     'siteData'   => $this->getSiteSettings(),
    //     ]);
    // }
    public function index()
    {
        return Inertia::render('Frontend', [
            'products'   => Product::where('status', true)->latest()->paginate(12), 
            'categories' => Category::all(),
            'siteData'   => $this->getSiteSettings(),
        ]);
    }
    // 1. All Products List
    public function products(Request $request)
    {
        $query = Product::where('status', true);

        // Category Filter (Optional)
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $products = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Frontend/Products', [
        'siteData'   => $this->getSiteSettings(),
        'products'   => $query->latest()->paginate(12)->withQueryString(),
        'categories' => Category::all()
    ]);
    }

    // 2. Single Product Detail
    public function productDetail($slug)
    {
        $product = Product::with(['category', 'healthConcerns:id,name'])
            ->where('slug', $slug)
            ->where('status', true)
            ->firstOrFail();

        // ── Related Products ──────────────────────────────────────
        // Same category, exclude self.
        // Priority: featured first, then most-viewed, then newest.
        $relatedProducts = Product::with(['category:id,name,slug'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', true)
            ->orderByDesc('featured')
            ->orderByDesc('number_of_view')
            ->orderByDesc('created_at')
            ->take(4)
            ->get(['id', 'name', 'slug', 'thumbnail', 'price', 'sale_price', 'featured', 'number_of_view']);

        // ── Recommended For You ───────────────────────────────────
        // Products sharing at least one health concern with this product.
        // Falls back to same-category if the product has no health concerns.
        // Priority: featured first, then most-viewed, then newest.
        $healthConcernIds = $product->healthConcerns->pluck('id');

        if ($healthConcernIds->isNotEmpty()) {
            $recommendedProducts = Product::with(['category:id,name,slug'])
                ->whereHas('healthConcerns', fn ($q) => $q->whereIn('health_concerns.id', $healthConcernIds))
                ->where('id', '!=', $product->id)
                ->where('status', true)
                ->orderByDesc('featured')
                ->orderByDesc('number_of_view')
                ->orderByDesc('created_at')
                ->take(4)
                ->get(['id', 'name', 'slug', 'thumbnail', 'price', 'sale_price', 'featured', 'number_of_view']);
        } else {
            // No health concerns — fallback: exclude products already in related, use same category
            $excludeIds = $relatedProducts->pluck('id')->push($product->id);
            $recommendedProducts = Product::with(['category:id,name,slug'])
                ->where('category_id', $product->category_id)
                ->whereNotIn('id', $excludeIds)
                ->where('status', true)
                ->orderByDesc('featured')
                ->orderByDesc('number_of_view')
                ->take(4)
                ->get(['id', 'name', 'slug', 'thumbnail', 'price', 'sale_price', 'featured', 'number_of_view']);
        }

        // Increment Views
        $product->increment('number_of_view');

        return Inertia::render('Frontend/SingleProduct', [
            'siteData'             => $this->getSiteSettings(),
            'product'              => $product,
            'relatedProducts'      => $relatedProducts,
            'recommendedProducts'  => $recommendedProducts,
        ]);
    }
}