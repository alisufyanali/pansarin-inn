<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'category_id',
        'short_description',
        'long_description',
        'urdu_name',
        'scientific_name',
        'alternative_name',
        'other_name',
        'slug',
        'unit',
        'quantity',
        'purchase_price_per_unit',
        'sale_price_per_unit',
        'price',
        'sale_price',
        'sku',
        'barcode',
        'stock_qty',
        'stock_alert',
        'status',
        'featured',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'tags',
        'schema_markup',
        'social_description',
        'thumbnail',
        'social_image',
        'gallery',
        'affiliate_commission',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'purchase_price_per_unit' => 'decimal:2',
        'sale_price_per_unit' => 'decimal:2',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_qty' => 'integer',
        'stock_alert' => 'integer',
        'status' => 'boolean',
        'featured' => 'boolean',
        'tags' => 'array',
        'gallery' => 'array',
        'affiliate_commission' => 'decimal:2',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
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

    // Accessors
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail 
            ? asset('storage/' . $this->thumbnail) 
            : asset('images/placeholder.png');
    }

    public function getSocialImageUrlAttribute()
    {
        return $this->social_image 
            ? asset('storage/' . $this->social_image) 
            : $this->getThumbnailUrlAttribute();
    }

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery || !is_array($this->gallery)) {
            return [];
        }

        return collect($this->gallery)->map(function($image) {
            return asset('storage/' . $image);
        })->toArray();
    }

    // Computed attributes for profit calculations
    public function getProfitPerUnitAttribute()
    {
        if (!$this->sale_price_per_unit || !$this->purchase_price_per_unit) {
            return 0;
        }
        return $this->sale_price_per_unit - $this->purchase_price_per_unit;
    }

    public function getTotalProfitAttribute()
    {
        if (!$this->quantity) {
            return 0;
        }
        return $this->profit_per_unit * $this->quantity;
    }

    public function getProfitMarginAttribute()
    {
        if (!$this->purchase_price_per_unit || $this->purchase_price_per_unit == 0) {
            return 0;
        }
        return ($this->profit_per_unit / $this->purchase_price_per_unit) * 100;
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

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_qty', '<=', 'stock_alert');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('stock_qty', 0);
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
        ->where(function($q) {
            $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
        })
        ->where(function($q) {
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
    
    if (!$deal) return $this->price;
    
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