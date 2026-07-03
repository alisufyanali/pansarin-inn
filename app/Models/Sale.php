<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Sale extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id', 'customer_id', 'sale_code',
        'city_id',
        'subtotal', 'product_discount', 'invoice_discount',
        'vat', 'vat_percent', 'shipping_charges', 'grand_total',
        'delivery_status', 'remarks', 'review', 'viewed',
        'shipping_address', 'shipping_method', 'shipping_response', 'delivery_datetime',
        'payment_type', 'payment_status', 'payment_details', 'payment_timestamp',
        'sale_datetime', 'is_active',
    ];

    protected $casts = [
        'subtotal'         => 'float',
        'product_discount' => 'float',
        'invoice_discount' => 'float',
        'vat'              => 'float',
        'shipping_charges' => 'float',
        'grand_total'      => 'float',
        'viewed'           => 'boolean',
        'is_active'        => 'boolean',
        'sale_datetime'    => 'datetime',
        'delivery_datetime'=> 'datetime',
        'payment_timestamp'=> 'datetime',
        'payment_details'  => 'array',
    ];

    // ── Relationships ─────────────────────────────────────────────

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    // ── Helpers ───────────────────────────────────────────────────

    public static function generateSaleCode(string $orderNumber): string
    {
        return 'SALE-' . $orderNumber . '-' . strtoupper(substr(uniqid(), -4));
    }

    public function calculateTotals(): void
    {
        $this->subtotal         = $this->items->sum('subtotal');
        $this->product_discount = $this->items->sum('discount');
        $this->grand_total      = $this->subtotal
                                - $this->product_discount
                                - $this->invoice_discount
                                + $this->shipping_charges
                                + $this->vat;
        $this->save();
    }
}