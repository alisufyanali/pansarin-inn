<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'apply_to',
        'product_id',
        'category_id',
        'min_purchase_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_count',
        'per_user_limit',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_purchase_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Check if coupon is valid
    public function isValid()
    {
        if (! $this->is_active) {
            return false;
        }

        // Check date validity
        $now = Carbon::now();
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }
        // end_date is a date — the coupon stays valid for the whole of that day
        if ($this->end_date && $now->gt($this->end_date->copy()->endOfDay())) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Part of the cart this coupon applies to.
     * $lines: [['product_id' => int, 'total' => float], ...]
     */
    public function eligibleAmount(array $lines): float
    {
        $lines = collect($lines);

        if ($this->apply_to === 'product') {
            return (float) $lines->where('product_id', $this->product_id)->sum('total');
        }

        if ($this->apply_to === 'category') {
            $productIds = Product::whereIn('id', $lines->pluck('product_id')->unique())
                ->where('category_id', $this->category_id)
                ->pluck('id')
                ->all();

            return (float) $lines->whereIn('product_id', $productIds)->sum('total');
        }

        return (float) $lines->sum('total');
    }

    // Calculate discount amount
    public function calculateDiscount($amount)
    {
        if ($this->discount_type === 'percentage') {
            $discount = ($amount * $this->discount_value) / 100;

            // Apply max discount cap if set
            if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                $discount = $this->max_discount_amount;
            }

            return $discount;
        }

        // Fixed discount
        return min($this->discount_value, $amount);
    }
}
