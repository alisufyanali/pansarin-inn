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

    /**
     * Derive sale_code from an order_number.
     * ORDER-50001 → SALE-50001
     * If multiple sales for same order: SALE-50001-2, SALE-50001-3 ...
     */
    public static function generateSaleCode(int $orderId, string $orderNumber): string
    {
        // Extract the numeric part: ORDER-50001 → 50001, ORD-XXXXX → use orderId fallback
        if (preg_match('/^ORDER-(\d+)$/', $orderNumber, $m)) {
            $num = $m[1];
        } else {
            // Legacy or unexpected format — use orderId as-is
            $num = $orderId;
        }

        // Count existing (non-soft-deleted) sales for this order
        $existingCount = static::withTrashed()
            ->where('order_id', $orderId)
            ->count();

        return $existingCount === 0
            ? 'SALE-' . $num
            : 'SALE-' . $num . '-' . ($existingCount + 1);
    }

    // ── Events ────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Auto-generate sale_code on creation if not already set
        static::creating(function (Sale $sale) {
            if (empty($sale->sale_code) && $sale->order_id) {
                $order = \App\Models\Order::find($sale->order_id);
                if ($order) {
                    $sale->sale_code = static::generateSaleCode($order->id, $order->order_number);
                }
            }
        });
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