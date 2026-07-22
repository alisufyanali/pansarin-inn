<?php

namespace App\Http\Repositories\Admin;

use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReturnRequestRepository
{
    // ── DataTable ─────────────────────────────────────────────────

    public function getAllForDataTable(Request $request)
    {
        $query = ReturnRequest::with([
            'order:id,order_number',
            'user:id,name,email',
            'user.customer:id,user_id,first_name,last_name,phone',
            'items',
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('order', fn ($q) => $q->where('order_number', 'like', "%{$search}%"))
                  ->orWhereHas('user', fn ($q) =>
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                  )
                  ->orWhereHas('user.customer', fn ($q) =>
                      $q->where('phone', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                  );
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('reason_category')) {
            $query->where('reason_category', $request->reason_category);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $returns = $query->paginate(min((int) $request->get('perPage', 10), 100));

        return response()->json([
            'data'         => $returns->map(fn ($r) => $this->format($r)),
            'total'        => $returns->total(),
            'per_page'     => $returns->perPage(),
            'current_page' => $returns->currentPage(),
            'last_page'    => $returns->lastPage(),
        ]);
    }

    // ── Find ──────────────────────────────────────────────────────

    public function find($id): ReturnRequest
    {
        return ReturnRequest::with([
            'order.items.product:id,name,sku',
            'order.items.variant:id,value,attributes',
            'user:id,name,email,phone',
            'user.customer:id,user_id,first_name,last_name,phone,address',
            'items.orderItem.product:id,name,sku',
            'items.orderItem.variant:id,value,attributes',
            'reviewer:id,name',
        ])->findOrFail($id);
    }

    // ── Status Update ─────────────────────────────────────────────

    /**
     * Approve, reject, or mark completed (refunded).
     * Sets reviewed_by + reviewed_at automatically.
     */
    public function updateStatus(int $id, string $status, array $data = []): ReturnRequest
    {
        $return = ReturnRequest::findOrFail($id);

        $return->update(array_filter([
            'status'        => $status,
            'admin_note'    => $data['admin_note']    ?? $return->admin_note,
            'refund_amount' => $data['refund_amount'] ?? $return->refund_amount,
            'reviewed_by'   => auth()->id(),
            'reviewed_at'   => now(),
        ], fn ($v) => $v !== null));

        return $return;
    }

    // ── Stats ─────────────────────────────────────────────────────

    public function getStats(): array
    {
        $counts = ReturnRequest::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved'  THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'rejected'  THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        ")->first();

        return [
            'total'     => (int) $counts->total,
            'pending'   => (int) $counts->pending,
            'approved'  => (int) $counts->approved,
            'rejected'  => (int) $counts->rejected,
            'completed' => (int) $counts->completed,
        ];
    }

    // ── Delete ────────────────────────────────────────────────────

    public function delete($id): bool
    {
        $return = ReturnRequest::findOrFail($id);
        $return->items()->delete();
        return $return->delete();
    }

    // ── Format helper ─────────────────────────────────────────────

    private function format(ReturnRequest $r): array
    {
        $customer = $r->user?->customer;

        return [
            'id'              => $r->id,
            'status'          => $r->status,
            'reason_category' => $r->reason_category,
            'comment'         => $r->comment,
            'refund_amount'   => $r->refund_amount,
            'admin_note'      => $r->admin_note,
            'items_count'     => $r->items->count(),
            'reviewed_at'     => $r->reviewed_at,
            'created_at'      => $r->created_at,
            'order'           => $r->order
                ? ['id' => $r->order->id, 'order_number' => $r->order->order_number]
                : null,
            'customer' => $customer ? [
                'id'         => $customer->id,
                'first_name' => $customer->first_name,
                'last_name'  => $customer->last_name,
                'phone'      => $customer->phone,
            ] : [
                'id'         => null,
                'first_name' => $r->user?->name ?? '—',
                'last_name'  => '',
                'phone'      => $r->user?->phone ?? '—',
            ],
        ];
    }
}
