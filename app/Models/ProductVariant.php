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
        // IMPORTANT: $this->attributes is Eloquent's internal raw-attribute bag,
        // NOT the cast JSON column. Use getAttribute() to get the cast value.
        $attrs = $this->getAttribute('attributes');

        if (!empty($attrs) && is_array($attrs)) {
            // Same pattern used in OrderRepository::syncItems() and SaleRepository::syncItems()
            return collect($attrs)->values()->join(' / ') ?: $this->value ?: $this->sku;
        }

        // No attributes JSON — fall back to the plain value string, then SKU
        return $this->value ?: $this->sku;
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