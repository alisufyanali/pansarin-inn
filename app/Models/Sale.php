<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'customer_id',
        'sale_code',
        'subtotal',
        'product_discount',
        'invoice_discount',
        'vat',
        'vat_percent',
        'shipping_charges',
        'grand_total',
        'delivery_status',
        'remarks',
        'review',
        'viewed',
        'shipping_address',
        'shipping_method',
        'shipping_response',
        'delivery_datetime',
        'payment_type',
        'payment_status',
        'payment_details',
        'payment_timestamp',
        'sale_datetime',
        'is_active',
    ];

    protected $casts = [
        'viewed' => 'boolean',
        'is_active' => 'boolean',
        'delivery_datetime' => 'datetime',
        'payment_timestamp' => 'datetime',
        'sale_datetime' => 'datetime',
        'subtotal' => 'decimal:2',
        'product_discount' => 'decimal:2',
        'invoice_discount' => 'decimal:2',
        'vat' => 'decimal:2',
        'shipping_charges' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Generate unique sale code
     */
    public static function generateSaleCode($orderNumber = null)
    {
        if ($orderNumber) {
            // Order number se derive karo
            return 'SALE-' . substr($orderNumber, 4);
        }
        
        // Ya unique code generate karo
        $date = now()->format('Ymd');
        $lastSale = static::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastSale ? ((int) substr($lastSale->sale_code, -4)) + 1 : 1;
        
        return 'SALE-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate totals from items
     */
    public function calculateTotals()
    {
        $itemsSubtotal = $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $itemsDiscount = $this->items->sum('discount');

        $this->subtotal = $itemsSubtotal;
        $this->product_discount = $itemsDiscount;
        
        $this->grand_total = $this->subtotal 
            - $this->product_discount 
            - $this->invoice_discount 
            + $this->vat 
            + $this->shipping_charges;

        $this->save();
    }

    /**
     * Scope for active sales
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific delivery status
     */
    public function scopeDeliveryStatus($query, $status)
    {
        return $query->where('delivery_status', $status);
    }

    /**
     * Scope for specific payment status
     */
    public function scopePaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Get full customer name
     */
    public function getCustomerNameAttribute()
    {
        return $this->customer 
            ? $this->customer->first_name . ' ' . $this->customer->last_name 
            : null;
    }
}