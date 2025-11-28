<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'sub_category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'thumbnail',
        'gallery',
        'short_description',
        'long_description',
        'price',
        'sale_price',
        'stock_qty',
        'stock_alert',
        'tags',
        'featured',
        'status',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'gallery' => 'array',
        'tags' => 'array',
        'featured' => 'boolean',
        'status' => 'boolean',
    ];

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_value', 'product_id', 'attribute_value_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function inventories()
    {
        return $this->hasManyThrough(Inventory::class, ProductVariant::class, 'product_id', 'product_variant_id');
    }

    // Accessor for image URL
    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail && !str_starts_with($this->thumbnail, 'http')) {
            return asset('storage/' . $this->thumbnail);
        }
        return $this->thumbnail ?? asset('images/placeholder.png');
    }

    // Helper methods
    public function isInStock(): bool
    {
        return $this->stock_qty > 0;
    }

    public function getDiscountPercentage(): float
    {
        if (!$this->sale_price || $this->price <= 0) {
            return 0;
        }
        return round((($this->price - $this->sale_price) / $this->price) * 100, 2);
    }
}
