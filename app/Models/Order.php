<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'order_number',
        'subtotal',
        'product_discount',
        'invoice_discount',
        'shipping_charges',
        'tax',
        'grand_total',
        'status',
        'order_note',
        'shipping_address',
        'billing_address',
        'shipping_method',
        'payment_method',
        'payment_status',
        'payment_date',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'product_discount' => 'float',
        'invoice_discount' => 'float',
        'shipping_charges' => 'float',
        'tax' => 'float',
        'grand_total' => 'float',
        'payment_date' => 'date',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Generate unique order number
    public static function generateOrderNumber()
    {
        $prefix = 'ORD-';
        $date = date('Ymd');
        $random = strtoupper(substr(uniqid(), -4));

        return $prefix.$date.'-'.$random;
    }

    // Calculate totals
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->product_discount = $this->items->sum('discount');

        // Grand Total = Subtotal - Product Discount - Invoice Discount + Shipping + Tax
        $this->grand_total = $this->subtotal
                           - $this->product_discount
                           - $this->invoice_discount
                           + $this->shipping_charges
                           + $this->tax;

        $this->save();
    }

    // Status badge color
    public function getStatusColorAttribute()
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'processing' => 'blue',
            'shipped' => 'purple',
            'delivered' => 'green',
            'cancelled' => 'red',
            'refunded' => 'gray',
            default => 'gray'
        };
    }

    // Payment status badge color
    public function getPaymentStatusColorAttribute()
    {
        return match ($this->payment_status) {
            'paid' => 'green',
            'unpaid' => 'red',
            'partially_paid' => 'yellow',
            'refunded' => 'gray',
            default => 'gray'
        };

    }

    protected static function booted()
    {
        static::updated(function ($order) {
            // Jab order status 'processing' ya 'delivered' ho jaye
            if ($order->wasChanged('status') && $order->status === 'delivered') {
                $order->reduceStock();
            }
        });
    }

    public function reduceStock()
    {
        foreach ($this->items as $item) {
            \App\Models\Inventory::create([
                'product_id' => $item->product_id,
                'quantity' => -abs($item->quantity), // Negative quantity for Stock Out
                'type' => 'out',
                'reference' => 'Order #'.$this->order_number,
                'unit' => $item->product->unit ?? 'pcs',
                'performed_by' => auth()->id() ?? 1, // System or Admin ID
                'note' => 'Auto stock out via Order Placement',
            ]);
        }
    }

    /**
     * Get the sale associated with the order
     */
    public function sale()
    {
        return $this->hasOne(Sale::class);
    }

    /**
     * Check if order has a sale
     */
    public function hasSale()
    {
        return $this->sale()->exists();
    }
}
