<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill existing orders with sequential ORDER-XXXXX numbers
     * and update their sales' sale_code to match.
     *
     * Only touches rows whose order_number does NOT already start with 'ORDER-'.
     */
    public function up(): void
    {
        // ── Orders ────────────────────────────────────────────────

        $orders = DB::table('orders')
            ->whereNotNull('order_number')
            ->where('order_number', 'NOT LIKE', 'ORDER-%')
            ->orderBy('created_at')
            ->orderBy('id')
            ->select('id', 'order_number')
            ->get();

        $counter = 50001;

        foreach ($orders as $order) {
            $newOrderNumber = 'ORDER-' . $counter;

            // Update order_number
            DB::table('orders')
                ->where('id', $order->id)
                ->update(['order_number' => $newOrderNumber]);

            // Update all sales that were linked to this order_number
            // Sales are linked by order_id (FK), so find sales for this order
            $sales = DB::table('sales')
                ->where('order_id', $order->id)
                ->orderBy('created_at')
                ->orderBy('id')
                ->select('id')
                ->get();

            $saleIndex = 1;
            foreach ($sales as $sale) {
                $newSaleCode = count($sales) > 1
                    ? 'SALE-' . $counter . '-' . $saleIndex
                    : 'SALE-' . $counter;

                DB::table('sales')
                    ->where('id', $sale->id)
                    ->update(['sale_code' => $newSaleCode]);

                $saleIndex++;
            }

            $counter++;
        }

        // Also backfill any standalone sales (no order or already-backfilled orders)
        // whose sale_code does NOT start with 'SALE-'
        $orphanSales = DB::table('sales')
            ->where('sale_code', 'NOT LIKE', 'SALE-%')
            ->orderBy('created_at')
            ->orderBy('id')
            ->select('id', 'order_id')
            ->get();

        foreach ($orphanSales as $sale) {
            // Try to get the parent order number
            $order = DB::table('orders')->where('id', $sale->order_id)->first();
            $orderNum = $order ? ltrim(str_replace('ORDER-', '', $order->order_number), 'ORDER-') : $counter;

            DB::table('sales')
                ->where('id', $sale->id)
                ->update(['sale_code' => 'SALE-' . $orderNum]);

            $counter++;
        }

        // Update sequences table so next generated number is correct
        $maxOrder = DB::table('orders')
            ->where('order_number', 'LIKE', 'ORDER-%')
            ->orderByRaw("CAST(SUBSTR(order_number, 7) AS UNSIGNED) DESC")
            ->value('order_number');

        if ($maxOrder) {
            $maxNum = (int) str_replace('ORDER-', '', $maxOrder);
            DB::table('sequences')
                ->where('key', 'order_number')
                ->update(['value' => $maxNum]);
        }
    }

    public function down(): void
    {
        // Irreversible data migration — down() intentionally left empty
    }
};
