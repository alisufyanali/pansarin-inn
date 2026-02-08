<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function productCatalog(Request $request)
    {
        // Sirf active products jo stock mein hon
        $products = Product::active()
            ->with('category:id,name')
            ->select('id', 'name', 'slug', 'sale_price', 'thumbnail', 'category_id', 'affiliate_commission')
            ->where('stock_qty', '>', 0)
            ->paginate(12);

        $categories = Category::has('products')->get(['id', 'name']);

        return Inertia::render('Affiliate/ProductCatalog', [
            'products' => $products,
            'categories' => $categories,
            // Hum auth user ki ID bhej rahe hain link generator ke liye
            'affiliate_id' => $request->user()->id 
        ]);
    }
}