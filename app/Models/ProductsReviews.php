<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $fillable = [
        'product_id', 'user_id', 'customer_name', 'customer_email',
        'order_number', 'rating', 'comment', 'is_verified', 'status',
        'show_on_homepage',
    ];

    protected $casts = [
        'status'          => 'boolean',
        'is_verified'     => 'boolean',
        'show_on_homepage'=> 'boolean',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot method to handle automatic verification
     */
    protected static function booted()
    {
        static::creating(function ($review) {
            // Agar user logged in hai aur usne order number dala hai
            if ($review->user_id && $review->order_number) {
                // Check karein ke is user ka is product ke liye koi successful order hai?
                // Example check (Aapke Order model ke mutabiq):
                // $hasPurchased = Order::where('id', $review->order_number)
                //    ->where('user_id', $review->user_id)
                //    ->whereHas('items', function($q) use ($review) {
                //        $q->where('product_id', $review->product_id);
                //    })->exists();

                // $review->is_verified = $hasPurchased;
            }
        });
    }
}
