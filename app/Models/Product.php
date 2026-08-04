<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'quantity',
        'purchase_price_per_unit',
        'sale_price_per_unit',
        'affiliate_commission',
        'name',
        'urdu_name',
        'scientific_name',
        'alternative_name',
        'other_name',
        'unit',
        'slug',
        'sku',
        'barcode',
        'thumbnail',
        'gallery',
        'short_description',
        'long_description',
        'price',
        'sale_price',
        'number_of_view',
        'video',
        'vendor_featured',
        'tags',
        'featured',
        'status',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'schema_markup',
        'social_image',
        'social_description',
        'ingredients',
        'how_to_use',
        'benefits',
        'key_features',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'purchase_price_per_unit' => 'decimal:2',
        'sale_price_per_unit' => 'decimal:2',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'number_of_view' => 'integer',
        'sort_order' => 'integer',
        'status' => 'boolean',
        'featured' => 'boolean',
        'tags' => 'array',
        'gallery' => 'array',
        'affiliate_commission' => 'decimal:2',
        'ingredients' => 'array',
        'how_to_use' => 'array',
        'benefits' => 'array',
        'key_features' => 'array',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Approved reviews visible in public product ratings.
     * withoutTrashed() ensures soft-deleted reviews are excluded
     * even though the global scope is only applied at query time.
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class)
            ->where('status', true)
            ->withoutTrashed();
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values')
            ->withPivot('price_adjustment');
    }

    public function healthConcerns(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(HealthConcern::class, 'product_health_concern');
    }

    // Accessors
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail
            ? asset('storage/'.$this->thumbnail)
            : asset('images/placeholder.png');
    }

    public function getSocialImageUrlAttribute()
    {
        return $this->social_image
            ? asset('storage/'.$this->social_image)
            : $this->getThumbnailUrlAttribute();
    }

    public function getGalleryUrlsAttribute()
    {
        if (! $this->gallery || ! is_array($this->gallery)) {
            return [];
        }

        return collect($this->gallery)->map(function ($image) {
            return asset('storage/'.$image);
        })->toArray();
    }


    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeOnSale($query)
    {
        return $query->whereNotNull('sale_price')
            ->whereColumn('sale_price', '<', 'price')
            ->where('sale_price', '>', 0);
    }

    // Add to Product model

    public function deals()
    {
        return $this->belongsToMany(Deal::class, 'deal_product')
            ->withPivot(['custom_discount', 'stock_limit', 'sold_count', 'display_order'])
            ->withTimestamps();
    }

    public function activeDeals()
    {
        return $this->deals()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function getBestDealAttribute()
    {
        return $this->activeDeals()->first();
    }

    public function getDiscountedPriceAttribute()
    {
        $deal = $this->best_deal;

        if (! $deal) {
            return $this->price;
        }

        $discount = $deal->pivot->custom_discount ?? $deal->discount_value;

        if ($deal->deal_type === 'percentage') {
            return $this->price - (($this->price * $discount) / 100);
        } elseif ($deal->deal_type === 'fixed') {
            return max(0, $this->price - $discount);
        }

        return $this->price;
    }

    public function getSavingsAttribute()
    {
        return $this->price - $this->discounted_price;
    }
}
