<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'type',
        'quantity',
        'cost_price',
        'reference',
        'source',
        'note',
    ];

    protected $casts = [
        'quantity'   => 'float',
        'cost_price' => 'float',
    ];

    // ── Relationships ──────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // ── Events ────────────────────────────────────────────────────

    protected static function booted()
    {
        // After create — add to stock
        static::created(function (Inventory $inventory) {
            $inventory->syncStock();
        });

        // After update — apply the difference
        static::updated(function (Inventory $inventory) {
            $old = $inventory->getOriginal('quantity');
            $new = $inventory->quantity;
            $diff = $new - $old;
            if ($diff != 0) {
                $inventory->adjustStock($diff);
            }
        });

        // After delete — reverse it
        static::deleted(function (Inventory $inventory) {
            $inventory->adjustStock(-$inventory->quantity);
        });
    }

    // ── Stock Sync Methods ────────────────────────────────────────

    /**
     * Update product_stocks when a new inventory entry is created
     */
    private function syncStock(): void
    {
        $this->adjustStock($this->quantity);
    }

    /**
     * Apply a delta to the stock — SQLite safe
     */
    private function adjustStock(float $delta): void
    {
        if ($delta == 0) return;

        $stock = ProductStock::where('product_id', $this->product_id)
            ->when(
                $this->product_variant_id,
                fn ($q) => $q->where('product_variant_id', $this->product_variant_id),
                fn ($q) => $q->whereNull('product_variant_id')
            )
            ->first();

        if ($stock) {
            $stock->update(['quantity' => $stock->quantity + $delta]);
        } else {
            ProductStock::create([
                'product_id'         => $this->product_id,
                'product_variant_id' => $this->product_variant_id,
                'quantity'           => $delta,
            ]);
        }

        $this->checkLowStock($delta);
    }

    /**
     * Low stock event trigger — only when this movement takes the stock from
     * above the threshold to at/below it, so admins get one alert, not one per sale.
     */
    private function checkLowStock(float $delta): void
    {
        $stock = ProductStock::where('product_id', $this->product_id)
            ->where(function ($q) {
                $this->product_variant_id
                    ? $q->where('product_variant_id', $this->product_variant_id)
                    : $q->whereNull('product_variant_id');
            })
            ->value('quantity') ?? 0;

        $threshold = 10; // default — products have no stock_alert column

        $previous = $stock - $delta;

        if ($stock <= $threshold && $stock > 0 && $previous > $threshold) {
            try {
                event(new \App\Events\LowStockAlert($this->product));
            } catch (\Throwable $e) {
                // Skip quietly when the event class does not exist
            }
        }
    }

    // ── Scopes ────────────────────────────────────────────────────

    public function scopeStockIn($query)
    {
        return $query->whereIn('type', ['in', 'return']);
    }

    public function scopeStockOut($query)
    {
        return $query->whereIn('type', ['out', 'adjustment']);
    }
}