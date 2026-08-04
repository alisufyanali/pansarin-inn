<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductReview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id', 'user_id',
        'customer_name', 'customer_email',
        'order_number', 'title', 'rating', 'comment',
        'images', 'helpful_count',
        'is_verified', 'status',
        'show_on_homepage',
        'admin_reply', 'admin_replied_at',
    ];

    protected $casts = [
        'status'           => 'boolean',
        'is_verified'      => 'boolean',
        'show_on_homepage' => 'boolean',
        'images'           => 'array',
        'helpful_count'    => 'integer',
        'admin_replied_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', true);
    }

    public function scopePending($query)
    {
        return $query->where('status', false);
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * Check whether a given user has a completed order containing this product.
     * Used by the API controller to auto-set is_verified on submission.
     */
    public static function isVerifiedPurchase(int $userId, int $productId): bool
    {
        return Order::where('status', 'delivered')
            ->whereHas('customer', fn ($q) => $q->where('user_id', $userId))
            ->whereHas('items', fn ($q) => $q->where('product_id', $productId))
            ->exists();
    }
}
