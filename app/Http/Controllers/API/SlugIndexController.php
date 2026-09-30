<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class SlugIndexController extends Controller
{
    public const CACHE_KEY = 'storefront_slug_index_v1';

    /**
     * GET /api/slugs — every live product and blog slug.
     *
     * The storefront proxy checks URLs against this before rendering, so a
     * page that does not exist gets a real 404 status (not 200) and old
     * /{category}/{product} links get a 308 to the one canonical /{product}.
     */
    public function index()
    {
        $data = Cache::remember(self::CACHE_KEY, 300, fn () => [
            'products' => Product::where('status', true)->orderBy('slug')->pluck('slug')->values()->all(),
            'blogs'    => Blog::published()->orderBy('slug')->pluck('slug')->values()->all(),
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }
}
