<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'sku',
        'attributes',
        'price',
        'stock',
        'is_default',
        'status'
    ];

   protected $casts = [
    'attributes' => 'array', // This will automatically convert JSON to array
    'is_default' => 'boolean',
    'status' => 'boolean',
];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'product_variant_id');
    }

    // Helper method to get variant display name (e.g., "120ml", "Red - M", etc.)
    public function getVariantNameAttribute(): string
    {
        if (!$this->attributes || empty($this->attributes)) {
            return $this->sku;
        }

        $parts = [];
        foreach ($this->attributes as $key => $value) {
            $parts[] = $value;
        }
        return implode(' - ', $parts);
    }

    // Get total stock from inventory
    public function getTotalStockAttribute(): int
    {
        return $this->inventories()->sum('quantity');
    }

    // Check if in stock
    public function isInStock(): bool
    {
        return $this->stock > 0;
    }
}