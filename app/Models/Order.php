<?php

namespace App\Models;

use App\Models\Concerns\HasTotals;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes, HasTotals;

    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'city_id',
        'order_number',
        'subtotal',
        'product_discount',
        'invoice_discount',
        'coupon_code',
        'points_redeemed',
        'points_discount',
        'shipping_charges',
        'tax',
        'grand_total',
        'status',
        'order_note',
        'shipping_address',
        'billing_address',
        'shipping_method',
        'courier_weight',
        'shipping_response',
        'payment_method',
        'payment_status',
        'payment_date',
        'delivered_at',
        'user_id',
    ];

    protected $casts = [
        'subtotal'         => 'float',
        'product_discount' => 'float',
        'invoice_discount' => 'float',
        'points_redeemed'  => 'integer',
        'points_discount'  => 'float',
        'shipping_charges' => 'float',
        'tax'              => 'float',
        'grand_total'      => 'float',
        'payment_date'     => 'date',
        'delivered_at'     => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────

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
        return $this->hasMany(OrderItem::class);
    }

    public function sale()
    {
        return $this->hasOne(Sale::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    /** Courier booking attempts, newest first */
    public function courierBookings()
    {
        return $this->hasMany(CourierBooking::class)->latest('id');
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * @deprecated Use booted() creating hook instead — order_number is now auto-generated.
     */
    public static function generateOrderNumber(): string
    {
        return 'ORDER-' . \App\Helpers\SequenceGenerator::next('order_number');
    }

    /**
     * Order carries a `tax` field as its extra charge component.
     */
    protected function totalsExtraCharge(): float
    {
        return (float) ($this->tax ?? 0);
    }

    public function hasSale(): bool
    {
        return $this->sales()->exists();
    }

    // ── Status display mapping (Sale delivery_status → customer-facing label) ──
    public static function mapDeliveryStatusToDisplay(string $deliveryStatus): string
    {
        return match ($deliveryStatus) {
            // A sale exists, so the order is confirmed and being prepared — never "pending" to the customer
            'pending'    => 'processing',
            'processing', 'shipped', 'delivered', 'cancelled' => $deliveryStatus,
            'returned' => 'cancelled',
            default      => 'pending',
        };
    }

    // ── Read-time customer-facing status: prefer Sale.delivery_status if Sale exists ──
    public function getDisplayStatusAttribute(): string
    {
        if (isset($this->relations['sale']) && $this->sale) {
            return static::mapDeliveryStatusToDisplay($this->sale->delivery_status);
        }
        if (isset($this->relations['sales']) && $this->sales->isNotEmpty()) {
            $latestSale = $this->sales->sortByDesc('id')->first();
            return static::mapDeliveryStatusToDisplay($latestSale->delivery_status);
        }
        $sale = $this->sale()->latest('id')->first();
        if ($sale) {
            return static::mapDeliveryStatusToDisplay($sale->delivery_status);
        }
        return $this->status;
    }

    // ── Accessors ─────────────────────────────────────────────────

    public function getStatusColorAttribute(): string
    {
        return match ($this->display_status) {
            'pending'    => 'yellow',
            'processing' => 'blue',
            'shipped'    => 'purple',
            'delivered'  => 'green',
            'cancelled'  => 'red',
            'refunded'   => 'gray',
            default      => 'gray',
        };
    }

    public function getPaymentStatusColorAttribute(): string
    {
        return match ($this->payment_status) {
            'paid'           => 'green',
            'unpaid'         => 'red',
            'partially_paid' => 'yellow',
            'refunded'       => 'gray',
            default          => 'gray',
        };
    }

    // ── Events ────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Auto-generate sequential order_number on creation
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORDER-' . \App\Helpers\SequenceGenerator::next('order_number');
            }
        });

        static::updated(function (Order $order) {
            if ($order->wasChanged('status') && $order->status === 'delivered') {
                if (! $order->delivered_at) {
                    $order->forceFill(['delivered_at' => now()])->saveQuietly();
                }
                $order->reduceStock();
                // Process affiliate commission — runs after stock reduction, idempotent guard inside service
                try {
                    $order->loadMissing('customer.user');
                    app(\App\Services\AffiliateService::class)->updateReferral($order);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Affiliate commission failed for order #' . $order->order_number, [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($order->wasChanged('status') && $order->status === 'cancelled') {
                $order->restoreStock();
                $order->releaseCoupon();
                app(\App\Services\LoyaltyRedemptionService::class)->refund($order);
                $order->releaseDeals();
            }
        });
    }

    // ── Stock Reduction on Delivery ───────────────────────────────

    /**
     * Stock is normally taken out when the order is placed (OrderRepository),
     * with reference = order_number. This only covers orders that were created
     * without that step, so an order is never deducted twice.
     */
    public function reduceStock(): void
    {
        // Load the items fresh (they may be cached from booted)
        $this->loadMissing('items');

        // Custom items (no product_id) are bought in from outside and never touch stock
        foreach ($this->items->whereNotNull('product_id') as $item) {
            // Already taken out of stock (at order placement or an earlier delivery)? Skip
            $alreadyDone = \App\Models\Inventory::where('product_id', $item->product_id)
                ->when(
                    $item->product_variant_id,
                    fn ($q) => $q->where('product_variant_id', $item->product_variant_id),
                    fn ($q) => $q->whereNull('product_variant_id')
                )
                ->whereIn('reference', [$this->order_number, 'Order #' . $this->order_number])
                ->where('type', 'out')
                ->exists();

            if ($alreadyDone) continue;

            \App\Models\Inventory::create([
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id ?? null,
                'type'               => 'out',
                'quantity'           => -abs($item->quantity), // The model event updates the stock
                'cost_price'         => null,
                'reference'          => 'Order #' . $this->order_number,
                'source'             => 'sale',
                'note'               => 'Auto stock out — Order delivered',
            ]);
        }
    }

    // ── Stock Return on Cancellation ──────────────────────────────

    /**
     * Put back whatever this order took out of stock. Idempotent: the net
     * quantity already moved for the order is what gets reversed.
     */
    public function restoreStock(string $source = 'order_cancel', string $notePrefix = 'Order cancelled #'): void
    {
        $this->loadMissing('items');

        foreach ($this->items->whereNotNull('product_id')->groupBy(fn ($i) => $i->product_id . '_' . ($i->product_variant_id ?? 'null')) as $group) {
            $item = $group->first();

            $netOut = -(float) \App\Models\Inventory::where('product_id', $item->product_id)
                ->when(
                    $item->product_variant_id,
                    fn ($q) => $q->where('product_variant_id', $item->product_variant_id),
                    fn ($q) => $q->whereNull('product_variant_id')
                )
                ->whereIn('reference', [$this->order_number, 'Order #' . $this->order_number])
                ->sum('quantity');

            if ($netOut <= 0) continue;

            \App\Models\Inventory::create([
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id ?? null,
                'type'               => 'in',
                'quantity'           => $netOut,
                'reference'          => $this->order_number,
                'source'             => $source,
                'note'               => $notePrefix . $this->order_number,
            ]);
        }
    }

    /** Give deal uses and deal units back when the order is cancelled. */
    public function releaseDeals(): void
    {
        $this->loadMissing('items');

        foreach ($this->items->whereNotNull('deal_id')->groupBy('deal_id') as $dealId => $items) {
            Deal::whereKey($dealId)->where('current_uses', '>', 0)->decrement('current_uses');

            foreach ($items->groupBy('product_id') as $productId => $productItems) {
                $units = (int) $productItems->sum(fn ($i) => $i->meta['deal_units'] ?? $i->quantity);
                $pivot = fn () => \Illuminate\Support\Facades\DB::table('deal_product')
                    ->where('deal_id', $dealId)->where('product_id', $productId);

                // Never below zero: clamp first, then decrement what is left
                $pivot()->where('sold_count', '<', $units)->update(['sold_count' => 0]);
                $pivot()->where('sold_count', '>=', $units)->decrement('sold_count', $units);
            }
        }
    }

    /** Give the coupon use back when the order is cancelled. */
    public function releaseCoupon(): void
    {
        if ($this->coupon_code) {
            Coupon::where('code', $this->coupon_code)->where('usage_count', '>', 0)->decrement('usage_count');
        }
    }
}
