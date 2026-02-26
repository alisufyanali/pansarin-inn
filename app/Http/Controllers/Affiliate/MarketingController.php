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

        $products = Product::active()
            ->with('category:id,name')
            ->select('id', 'name', 'slug', 'sale_price', 'thumbnail', 'category_id', 'affiliate_commission')
            ->where('stock_qty', '>', 0)
            ->paginate(12)
            ->through(function($product) {

                $product->commission_amount = ($product->sale_price * $product->affiliate_commission) / 100;
                return $product;
            });

        $categories = Category::has('products')->get(['id', 'name']);

        return Inertia::render('Affiliate/ProductCatalog', [
            'products' => $products,
            'categories' => $categories,
            'affiliate_id' => $request->user()->id 
        ]);
    }
}