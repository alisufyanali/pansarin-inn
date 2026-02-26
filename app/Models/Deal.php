<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Deal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'image',
        'deal_type', 'discount_value', 'min_quantity', 'free_quantity',
        'min_purchase_amount', 'max_uses', 'max_uses_per_user', 'current_uses',
        'starts_at', 'ends_at',
        'badge_text', 'badge_color', 'display_order', 'is_featured', 'is_active',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
        'min_purchase_amount' => 'decimal:2',
    ];

    // Auto-generate slug
    protected static function booted()
    {
        static::creating(function ($deal) {
            if (! $deal->slug) {
                $deal->slug = Str::slug($deal->title);
            }
        });
    }

    // Relationships
    public function products()
    {
        return $this->belongsToMany(Product::class, 'deal_product')
            ->withPivot(['custom_discount', 'stock_limit', 'sold_count', 'display_order'])
            ->withTimestamps()
            ->orderBy('deal_product.display_order');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('ends_at', '<', now());
    }

    // Accessors
    public function getIsActiveNowAttribute()
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }
        if ($this->ends_at && $now->gt($this->ends_at)) {
            return false;
        }

        return true;
    }

    public function getTimeRemainingAttribute()
    {
        if (! $this->ends_at) {
            return null;
        }

        return now()->diffInSeconds($this->ends_at, false);
    }

    public function getIsExpiredAttribute()
    {
        return $this->ends_at && now()->gt($this->ends_at);
    }

    public function getUsagePercentageAttribute()
    {
        if (! $this->max_uses) {
            return 0;
        }

        return ($this->current_uses / $this->max_uses) * 100;
    }

    // Methods
    public function canBeUsed()
    {
        if (! $this->is_active_now) {
            return false;
        }
        if ($this->max_uses && $this->current_uses >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($subtotal, $quantity = 1)
    {
        switch ($this->deal_type) {
            case 'percentage':
                return ($subtotal * $this->discount_value) / 100;

            case 'fixed':
                return $this->discount_value;

            case 'buy_x_get_y':
                // Calculate free items value
                $freeItems = floor($quantity / $this->min_quantity) * $this->free_quantity;

                // Assuming product price calculation
                return 0; // Implement based on product

            default:
                return 0;
        }
    }

    public function incrementUsage()
    {
        $this->increment('current_uses');
    }
}
