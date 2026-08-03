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
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'icon']);

        return response()->json([
            'success' => true,
            'data'    => $concerns->map(fn ($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'slug'     => $c->slug,
                'icon_url' => $c->icon ? asset('storage/' . $c->icon) : null,
            ]),
        ]);
    }
}
