<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OffersApiController extends Controller
{
    /**
     * GET /api/offers
     *
     * Returns all currently active public promotions/coupons.
     * Only shows coupons that are active, within date range, and have usage remaining.
     * Coupon codes are included so the frontend can display them directly.
     */
    public function index(Request $request)
    {
        $now = Carbon::now();

        $coupons = Coupon::where('is_active', true)
            ->where(function ($q) use ($now) {
                // start_date is null OR start_date <= today
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now->toDateString());
            })
            ->where(function ($q) use ($now) {
                // end_date is null OR end_date >= today
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now->toDateString());
            })
            ->where(function ($q) {
                // usage_limit is null OR usage_count < usage_limit
                $q->whereNull('usage_limit')
                  ->orWhereRaw('usage_count < usage_limit');
            })
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $coupons->map(fn ($c) => [
                'id'                  => $c->id,
                'code'                => $c->code,
                'description'         => $c->description,
                'discount_type'       => $c->discount_type,       // percentage | fixed
                'discount_value'      => (float) $c->discount_value,
                'max_discount_amount' => $c->max_discount_amount ? (float) $c->max_discount_amount : null,
                'min_purchase_amount' => $c->min_purchase_amount ? (float) $c->min_purchase_amount : null,
                'apply_to'            => $c->apply_to,
                'start_date'          => $c->start_date?->toDateString(),
                'end_date'            => $c->end_date?->toDateString(),
            ]),
        ]);
    }
}
