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
        // After create — stock add karo
        static::created(function (Inventory $inventory) {
            $inventory->syncStock();
        });

        // After update — diff apply karo
        static::updated(function (Inventory $inventory) {
            $old = $inventory->getOriginal('quantity');
            $new = $inventory->quantity;
            $diff = $new - $old;
            if ($diff != 0) {
                $inventory->adjustStock($diff);
            }
        });

        // After delete — reverse karo
        static::deleted(function (Inventory $inventory) {
            $inventory->adjustStock(-$inventory->quantity);
        });
    }

    // ── Stock Sync Methods ────────────────────────────────────────

    /**
     * Naya inventory entry create hone pe product_stocks update karo
     */
    private function syncStock(): void
    {
        $this->adjustStock($this->quantity);
    }

    /**
     * Stock mein delta apply karo — SQLite safe
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

        $this->checkLowStock();
    }

    /**
     * Low stock event trigger
     */
    private function checkLowStock(): void
    {
        $stock = ProductStock::where('product_id', $this->product_id)
            ->where(function ($q) {
                $this->product_variant_id
                    ? $q->where('product_variant_id', $this->product_variant_id)
                    : $q->whereNull('product_variant_id');
            })
            ->value('quantity') ?? 0;

        $threshold = 10; // default — product mein stock_alert column nahi

        if ($stock <= $threshold && $stock > 0) {
            try {
                event(new \App\Events\LowStockAlert($this->product));
            } catch (\Throwable $e) {
                // Event class nahi bani toh silently skip
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