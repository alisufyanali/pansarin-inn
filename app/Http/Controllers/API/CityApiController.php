<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityApiController extends Controller
{
    /**
     * GET /api/cities
     *
     * Returns all non-deleted cities ordered alphabetically.
     * Public — no auth required (needed at guest checkout).
     * No pagination — the full list is small enough to return at once.
     */
    public function index()
    {
        $cities = City::orderBy('name')
            ->get(['id', 'name', 'province', 'shipping_charges']);

        return response()->json([
            'success' => true,
            'data'    => $cities->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'province'         => $c->province,
                'shipping_charge'  => (float) $c->shipping_charges,
            ]),
        ]);
    }
}
