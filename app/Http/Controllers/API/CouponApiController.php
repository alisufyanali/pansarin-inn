<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponApiController extends Controller
{
    // POST /api/coupons/validate
    public function check(Request $request)
    {
        $request->validate([
            'code'       => 'required|string',
            'amount'     => 'required|numeric|min:0',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $coupon = Coupon::with(['product', 'category'])
            ->where('code', strtoupper($request->code))
            ->first();

        if (! $coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found.',
            ], 404);
        }

        if (! $coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is expired or inactive.',
            ], 422);
        }

        // Min purchase check
        if ($coupon->min_purchase_amount && $request->amount < $coupon->min_purchase_amount) {
            return response()->json([
                'success' => false,
                'message' => "Minimum purchase of {$coupon->min_purchase_amount} required.",
            ], 422);
        }

        $discountAmount = $coupon->calculateDiscount($request->amount);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully.',
            'data'    => [
                'code'            => $coupon->code,
                'discount_type'   => $coupon->discount_type,
                'discount_value'  => (float) $coupon->discount_value,
                'discount_amount' => round($discountAmount, 2),
                'apply_to'        => $coupon->apply_to,
                'product_id'      => $coupon->product_id,
                'category_id'     => $coupon->category_id,
            ],
        ]);
    }
}
