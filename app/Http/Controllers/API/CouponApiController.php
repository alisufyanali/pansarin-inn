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
            'items'              => 'nullable|array',
            'items.*.product_id' => 'required_with:items|integer',
            'items.*.price'      => 'required_with:items|numeric|min:0',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
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

        // Product/category coupons only discount the matching part of the cart —
        // the same rule the order endpoints apply when the order is placed.
        $eligible = (float) $request->amount;
        if ($request->filled('items')) {
            $eligible = $coupon->eligibleAmount(collect($request->items)->map(fn ($i) => [
                'product_id' => (int) $i['product_id'],
                'total'      => (float) $i['price'] * (int) $i['quantity'],
            ])->all());
        } elseif ($coupon->apply_to === 'product' && $request->filled('product_id')
            && (int) $request->product_id !== (int) $coupon->product_id) {
            $eligible = 0;
        }

        if ($eligible <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon does not apply to the items in your cart.',
            ], 422);
        }

        $discountAmount = min($coupon->calculateDiscount($eligible), $eligible);

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
