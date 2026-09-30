<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HealthConcern;

class HealthConcernApiController extends Controller
{
    // GET /api/health-concerns
    public function index()
    {
        $concerns = HealthConcern::active()
            // Same rule as GET /api/products?health_concern_id= (active products only)
            ->withCount(['products' => fn ($q) => $q->where('status', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'icon']);

        return response()->json([
            'success' => true,
            'data'    => $concerns->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'icon_url'       => $c->icon ? asset('storage/' . $c->icon) : null,
                'products_count' => (int) $c->products_count,
            ]),
        ]);
    }
}
