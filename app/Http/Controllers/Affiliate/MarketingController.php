<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function productCatalog(Request $request)
    {
        // 1. Products fetch karein with pagination
        $products = Product::active()
            ->with('category:id,name')
            ->select('id', 'name', 'slug', 'sale_price', 'thumbnail', 'category_id', 'affiliate_commission')
            ->where('stock_qty', '>', 0)
            ->paginate(12)
            ->through(function($product) {
                // Har product ke liye commission amount calculate karein (Rs. mein)
                // Agar sale_price 1000 hai aur commission 5% hai, to ye 50 banayega.
                $product->commission_amount = ($product->sale_price * $product->affiliate_commission) / 100;
                return $product;
            });

        // 2. Sirf wo categories jin mein products hain
        $categories = Category::has('products')->get(['id', 'name']);

        return Inertia::render('Affiliate/ProductCatalog', [
            'products' => $products,
            'categories' => $categories,
            'affiliate_id' => $request->user()->id 
        ]);
    }
}