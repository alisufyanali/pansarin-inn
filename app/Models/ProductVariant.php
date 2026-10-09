<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;     // ← was missing
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
        return $this->label();
    }

    /**
     * Customer-facing variant label with the product unit, e.g.
     * "250 gm / Powder", "30 ml", "1 Pc". Same format the storefront product
     * page builds, so cart, orders, emails and admin all read the same.
     *
     * @param  string|null  $unit  product unit; loaded from the product when omitted
     */
    public function label(?string $unit = null): string
    {
        // IMPORTANT: $this->attributes is Eloquent's internal raw-attribute bag,
        // NOT the cast JSON column. Use getAttribute() to get the cast value.
        $unit ??= $this->relationLoaded('product') || $this->product_id ? $this->product?->unit : null;

        return static::labelFor($this->getAttribute('attributes'), $this->value, $unit, $this->sku);
    }

    /**
     * Build a label from raw variant data.
     * The first non-"Form" attribute (Weight / Size / Pack / …) carries the unit;
     * the remaining attributes (usually Form) follow after " / ".
     */
    public static function labelFor(mixed $attributes, ?string $value, ?string $unit, ?string $sku = null): string
    {
        $unit  = trim((string) $unit);
        $attrs = collect(is_array($attributes) ? $attributes : [])
            ->map(fn ($v) => trim((string) $v))
            ->filter(fn ($v) => $v !== '');

        $withUnit = function (string $amount) use ($unit): string {
            // Values like "100 gm" already carry a unit — don't add a second one
            return $unit !== '' && ! preg_match('/[a-z]/i', $amount) ? "{$amount} {$unit}" : $amount;
        };

        if ($attrs->isNotEmpty()) {
            $primaryKey = $attrs->keys()->first(fn ($k) => strcasecmp((string) $k, 'Form') !== 0);

            $parts = [];
            if ($primaryKey !== null) {
                $parts[] = $withUnit($attrs[$primaryKey]);
            }
            foreach ($attrs as $key => $val) {
                if ($key !== $primaryKey) {
                    $parts[] = $val;
                }
            }

            return implode(' / ', $parts);
        }

        $value = trim((string) $value);

        return $value !== '' ? $withUnit($value) : (string) $sku;
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