<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'quantity',
        'unit', // Add this
        'type',
        'reference',
        'note',
        'performed_by',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // Events
    protected static function booted()
    {
        static::created(function ($inventory) {
            $inventory->updateProductStock();
        });

        static::created(function ($inventory) {
            $inventory->updateProductStock();
        });

        static::updated(function ($inventory) {
            $inventory->updateProductStock();
        });

        static::deleted(function ($inventory) {
            $inventory->updateProductStock(true);
        });
    }

    // Product stock ko sync karne ka method
    public function updateProductStock($isDeleted = false)
    {
        $product = $this->product;
        if (! $product) {
            return;
        }

        // Direct Database se sum nikalen taake purana data bhi count ho
        $totalStock = \App\Models\Inventory::where('product_id', $this->product_id)->sum('quantity');

        // Product update karein
        $product->stock_qty = $totalStock;
        $product->save();

        $this->checkLowStock($product);

        $product = $this->product;
        if ($product) {
            // Saari entries ka sum nikal kar product stock update karein
            $totalStock = Inventory::where('product_id', $this->product_id)->sum('quantity');
            $product->update(['stock_qty' => $totalStock]);
        }
    }

    //  Low stock notification trigger
    protected function checkLowStock($product)
    {
        $threshold = $product->stock_alert ?? 10;

        if ($product->stock_qty <= $threshold && $product->stock_qty > 0) {
            // Trigger notification
            event(new \App\Events\LowStockAlert($product));
        }
    }

    //  Scope for low stock products
    public function scopeLowStock($query)
    {
        return $query->whereHas('product', function ($q) {
            $q->whereColumn('stock_qty', '<=', 'stock_alert');
        });
    }
}
