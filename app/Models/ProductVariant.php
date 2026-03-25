<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;     // ← yeh missing tha
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'sku',
        'attribute_value_id',
        'value',
        'attributes',
        'additional',
        'price',
        'sale_price',
        'stock_alert',
        'is_default',
        'status',
    ];

    protected $casts = [
        'attributes'  => 'array',
        'additional'  => 'integer',
        'price'       => 'decimal:2',
        'sale_price'  => 'decimal:2',
        'stock_alert' => 'integer',
        'is_default'  => 'boolean',
        'status'      => 'boolean',
    ];

    // ── Relationships ──────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'product_variant_id');
    }

    public function stock(): HasOne
    {
        return $this->hasOne(ProductStock::class);
    }

    // ── Accessors ──────────────────────────────────────────────────

    public function getVariantNameAttribute(): string
    {
        if (empty($this->attributes)) {
            return $this->sku;
        }

        return implode(' - ', array_values($this->attributes));
    }

    public function getTotalStockAttribute(): int
    {
        return $this->inventories()->sum('quantity');
    }

    // ── Helpers ────────────────────────────────────────────────────

    public function isInStock(): bool
    {
        return $this->stock?->quantity > 0;
    }
}