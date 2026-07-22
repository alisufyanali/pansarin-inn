<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ReturnRequestRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReturnRequestController extends Controller
{
    public function __construct(protected ReturnRequestRepository $repo)
    {
        $this->middleware('permission:view.return-requests')->only(['index', 'getData', 'show']);
        $this->middleware('permission:edit.return-requests')->only(['updateStatus']);
        $this->middleware('permission:delete.return-requests')->only(['destroy']);
    }

    /**
     * GET /admin/returns
     */
    public function index()
    {
        return Inertia::render('Admin/Returns/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    /**
     * GET /admin/returns-data   — DataTableWrapper endpoint
     */
    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('ReturnRequest getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    /**
     * GET /admin/returns/{id}
     */
    public function show(string $id)
    {
        try {
            return Inertia::render('Admin/Returns/Show', [
                'returnRequest' => $this->formatDetail($this->repo->find($id)),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.returns.index')->with('error', 'Return request not found.');
        }
    }

    /**
     * POST /admin/returns/{id}/status
     * Body: { status: 'approved'|'rejected'|'completed', admin_note?, refund_amount? }
     */
    public function updateStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'status'        => 'required|in:approved,rejected,completed',
                'admin_note'    => 'nullable|string|max:1000',
                'refund_amount' => 'nullable|numeric|min:0',
            ]);

            $this->repo->updateStatus((int) $id, $validated['status'], $validated);

            $messages = [
                'approved'  => 'Return request approved.',
                'rejected'  => 'Return request rejected.',
                'completed' => 'Return marked as refunded/completed.',
            ];

            return back()->with('success', $messages[$validated['status']] ?? 'Status updated.');
        } catch (\Exception $e) {
            Log::error('ReturnRequest updateStatus: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * DELETE /admin/returns/{id}
     */
    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);
            return redirect()->route('admin.returns.index')->with('success', 'Return request deleted.');
        } catch (\Exception $e) {
            Log::error('ReturnRequest destroy: ' . $e->getMessage());
            return redirect()->route('admin.returns.index')->with('error', 'Failed to delete return request.');
        }
    }

    // ── Format full detail for Show page ─────────────────────────

    private function formatDetail(\App\Models\ReturnRequest $r): array
    {
        $customer = $r->user?->customer;

        return [
            'id'              => $r->id,
            'status'          => $r->status,
            'reason_category' => $r->reason_category,
            'comment'         => $r->comment,
            'refund_amount'   => $r->refund_amount,
            'admin_note'      => $r->admin_note,
            'reviewed_at'     => $r->reviewed_at?->toDateTimeString(),
            'created_at'      => $r->created_at->toDateTimeString(),
            'reviewer'        => $r->reviewer ? ['id' => $r->reviewer->id, 'name' => $r->reviewer->name] : null,
            'order'           => $r->order ? [
                'id'           => $r->order->id,
                'order_number' => $r->order->order_number,
                'grand_total'  => (float) $r->order->grand_total,
                'status'       => $r->order->status,
            ] : null,
            'customer' => $customer ? [
                'id'         => $customer->id,
                'first_name' => $customer->first_name,
                'last_name'  => $customer->last_name,
                'phone'      => $customer->phone,
                'address'    => $customer->address,
            ] : [
                'id'         => null,
                'first_name' => $r->user?->name ?? '—',
                'last_name'  => '',
                'phone'      => $r->user?->phone ?? '—',
                'address'    => null,
            ],
            'items' => $r->items->map(function ($item) {
                $orderItem = $item->orderItem;
                $product   = $orderItem?->product;
                $variant   = $orderItem?->variant;

                return [
                    'id'           => $item->id,
                    'quantity'     => $item->quantity,
                    'item_reason'  => $item->item_reason,
                    'product_name' => $orderItem?->meta['product_name'] ?? $product?->name ?? '—',
                    'variant_name' => $orderItem?->meta['variant_name']
                        ?? ($variant ? collect($variant->attributes ?? [])->values()->join(' / ') ?: $variant->value : null),
                    'sku'          => $orderItem?->meta['sku'] ?? $product?->sku ?? '—',
                    'original_qty' => $orderItem?->quantity ?? 0,
                    'unit_price'   => (float) ($orderItem?->price ?? 0),
                ];
            })->toArray(),
        ];
    }
}
