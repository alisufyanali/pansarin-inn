<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Models\ReturnRequestItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ReturnApiController extends Controller
{
    /**
     * POST /api/returns
     *
     * Initiate a return request.
     * Rules:
     *  - Order must belong to the authenticated user.
     *  - Order must have been delivered (status = 'delivered').
     *  - Return must be within 7 days of the delivery date (updated_at when status changed — we
     *    use order updated_at as the proxy for delivery date since there is no dedicated delivered_at column).
     *  - Each item quantity cannot exceed what was originally ordered.
     *  - Duplicate return requests for the same order are blocked.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_id'           => 'required|integer|exists:orders,id',
                'reason_category'    => 'required|in:defective,wrong_item,not_needed,other',
                'comment'            => 'nullable|string|max:1000',
                'items'              => 'required|array|min:1',
                'items.*.order_item_id' => 'required|integer|exists:order_items,id',
                'items.*.quantity'   => 'required|integer|min:1',
                'items.*.item_reason'=> 'nullable|string|max:255',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $user     = $request->user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        // Load order and verify ownership
        $order = Order::with('items')->findOrFail($validated['order_id']);

        if ($order->customer_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => 'This order does not belong to you.'], 403);
        }

        // Must be delivered
        if ($order->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Returns can only be initiated for delivered orders.',
            ], 422);
        }

        // 7-day return window — using order's updated_at as the delivery timestamp proxy
        $deliveredAt = $order->updated_at;
        if (Carbon::now()->diffInDays($deliveredAt, true) > 7) {
            return response()->json([
                'success' => false,
                'message' => 'Return window has expired. Returns must be requested within 7 days of delivery.',
            ], 422);
        }

        // Block duplicate return requests for same order
        if (ReturnRequest::where('order_id', $order->id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'A return request for this order has already been submitted.',
            ], 422);
        }

        // Validate that all submitted order_item_ids belong to this order
        // and quantities don't exceed originally ordered amounts
        $orderItemsMap = $order->items->keyBy('id');
        $itemErrors    = [];

        foreach ($validated['items'] as $idx => $item) {
            $orderItem = $orderItemsMap->get($item['order_item_id']);

            if (! $orderItem) {
                $itemErrors[] = "Item #{$idx}: order_item_id {$item['order_item_id']} does not belong to this order.";
                continue;
            }

            if ($item['quantity'] > $orderItem->quantity) {
                $itemErrors[] = "Item #{$idx}: return quantity ({$item['quantity']}) exceeds ordered quantity ({$orderItem->quantity}).";
            }
        }

        if (! empty($itemErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Item validation failed.',
                'errors'  => ['items' => $itemErrors],
            ], 422);
        }

        try {
            $returnRequest = DB::transaction(function () use ($validated, $order, $user) {
                $return = ReturnRequest::create([
                    'order_id'        => $order->id,
                    'user_id'         => $user->id,
                    'status'          => 'pending',
                    'reason_category' => $validated['reason_category'],
                    'comment'         => $validated['comment'] ?? null,
                ]);

                foreach ($validated['items'] as $item) {
                    ReturnRequestItem::create([
                        'return_request_id' => $return->id,
                        'order_item_id'     => $item['order_item_id'],
                        'quantity'          => $item['quantity'],
                        'item_reason'       => $item['item_reason'] ?? null,
                    ]);
                }

                return $return->load('items');
            });

            return response()->json([
                'success' => true,
                'message' => 'Return request submitted successfully. Our team will review it within 2-3 business days.',
                'data'    => [
                    'return_request_id' => $returnRequest->id,
                    'order_id'          => $returnRequest->order_id,
                    'status'            => $returnRequest->status,
                    'reason_category'   => $returnRequest->reason_category,
                    'items_count'       => $returnRequest->items->count(),
                    'created_at'        => $returnRequest->created_at->toDateTimeString(),
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Return request creation failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to submit return request. Please try again.'], 500);
        }
    }

    /**
     * GET /api/returns
     *
     * List authenticated user's return requests.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $returns = ReturnRequest::with(['order:id,order_number', 'items'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data'    => $returns->map(fn ($r) => [
                'id'              => $r->id,
                'order_number'    => $r->order?->order_number,
                'status'          => $r->status,
                'reason_category' => $r->reason_category,
                'comment'         => $r->comment,
                'items_count'     => $r->items->count(),
                'admin_note'      => $r->admin_note,
                'created_at'      => $r->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'total'        => $returns->total(),
                'per_page'     => $returns->perPage(),
                'current_page' => $returns->currentPage(),
                'last_page'    => $returns->lastPage(),
            ],
        ]);
    }
}
