<?php

namespace App\Models\Concerns;

/**
 * Shared totals calculation for Order and Sale models.
 *
 * Both models share the same formula:
 *   grand_total = subtotal - product_discount - invoice_discount + shipping_charges + <extra>
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
        $this->subtotal         = $this->items->sum('subtotal');
        $this->product_discount = $this->items->sum('discount');
        $this->grand_total      = $this->subtotal
                                - $this->product_discount
                                - $this->invoice_discount
                                + $this->shipping_charges
                                + $this->totalsExtraCharge();
        $this->save();
    }
}
