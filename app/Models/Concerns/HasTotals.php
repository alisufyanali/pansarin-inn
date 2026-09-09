<?php

namespace App\Models\Concerns;

/**
 * Shared totals calculation for Order and Sale models.
 *
 * Both models share the same formula:
 *   grand_total = subtotal - invoice_discount + shipping_charges + <extra>
 *
 * NOTE: product_discount is NOT in the grand_total formula. Each item's subtotal is already
 * stored as (price*qty)-discount, so product_discount is implicit in subtotal and must not
 * be subtracted again. It is persisted for display/reporting purposes only.
 *
 * The <extra> field differs per model:
 *   - Order uses `tax`
 *   - Sale  uses `vat`
 *
 * Override totalsExtraCharge() in the model to return the correct field value.
 */
trait HasTotals
{
    /**
     * Return the model-specific extra charge added to grand_total.
     * Order → $this->tax   |   Sale → $this->vat
     */
    protected function totalsExtraCharge(): float
    {
        // Default to zero; models override this if they carry an extra charge field.
        return 0.0;
    }

    /**
     * Recalculate and persist subtotal, product_discount, and grand_total
     * from the model's loaded items collection.
     *
     * Call after items are loaded: $model->load('items'); $model->calculateTotals();
     */
    public function calculateTotals(): void
    {
        $this->subtotal         = $this->items->sum('subtotal');   // SUM((price*qty)-discount) per item
        $this->product_discount = $this->items->sum('discount');   // stored for display/reporting only

        // product_discount is NOT subtracted here — it is already baked into each item's subtotal
        // (item.subtotal = (price*qty) - item.discount), so subtracting it again would double-count.
        $this->grand_total      = $this->subtotal
                                - $this->invoice_discount
                                + $this->shipping_charges
                                + $this->totalsExtraCharge();
        $this->save();
    }
}
