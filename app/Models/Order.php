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
        'city_id',
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
        'courier_weight',
        'shipping_response',
        'payment_method',
        'payment_status',
        'payment_date',
        'user_id',
    ];

    protected $casts = [
        'subtotal'         => 'float',
        'product_discount' => 'float',
        'invoice_discount' => 'float',
        'shipping_charges' => 'float',
        'tax'              => 'float',
        'grand_total'      => 'float',
        'payment_date'     => 'date',
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
            'pending', 'processing', 'shipped', 'delivered', 'cancelled' => $deliveryStatus,
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
        });
    }

    // ── Stock Reduction on Delivery ───────────────────────────────

    public function reduceStock(): void
    {
        // Items fresh load karo (booted mein cached ho sakta hai)
        $this->loadMissing('items');

        foreach ($this->items as $item) {
            // Already stock out hua hai? Skip karo
            $alreadyDone = \App\Models\Inventory::where('product_id', $item->product_id)
                ->where('product_variant_id', $item->product_variant_id)
                ->where('reference', 'Order #' . $this->order_number)
                ->where('type', 'out')
                ->exists();

            if ($alreadyDone) continue;

            \App\Models\Inventory::create([
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id ?? null,
                'type'               => 'out',
                'quantity'           => -abs($item->quantity), // Model event handle karega stock
                'cost_price'         => null,
                'reference'          => 'Order #' . $this->order_number,
                'source'             => 'sale',
                'note'               => 'Auto stock out — Order delivered',
            ]);
        }
    }
}