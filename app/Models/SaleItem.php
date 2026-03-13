<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SaleItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sale_id', 'product_id', 'product_variant_id',
        'quantity', 'price', 'discount', 'subtotal', 'meta',
    ];

    protected $casts = [
        'price'    => 'float',
        'discount' => 'float',
        'subtotal' => 'float',
        'meta'     => 'array',
    ];

    public function sale()    { return $this->belongsTo(Sale::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function variant() { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}