<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'price',
        'discount',
        'subtotal',
        'meta',
    ];

    protected $casts = [
        'quantity' => 'int',
        'price' => 'float',
        'discount' => 'float',
        'subtotal' => 'float',
        'meta' => 'array',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // Calculate subtotal
    public function calculateSubtotal()
    {
        $this->subtotal = ($this->price * $this->quantity) - $this->discount;
        $this->save();
    }

    // Get product name from meta or relationship
    public function getProductNameAttribute()
    {
        if ($this->meta && isset($this->meta['product_name'])) {
            return $this->meta['product_name'];
        }

        return $this->product?->name ?? 'N/A';
    }

    // Get variant name from meta or relationship
    public function getVariantNameAttribute()
    {
        if ($this->meta && isset($this->meta['variant_name'])) {
            return $this->meta['variant_name'];
        }

        return $this->variant?->name ?? null;
    }
}
