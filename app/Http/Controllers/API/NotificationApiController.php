<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * GET /api/notifications
     *
     * Returns paginated notifications for the authenticated user.
     * Also returns unread count as a convenience field.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->paginate($request->get('per_page', 15));

        $unreadCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'unread_count'  => $unreadCount,
                'notifications' => $notifications->map(fn ($n) => [
                    'id'         => $n->id,
                    'title'      => $n->title,
                    'message'    => $n->message,
                    'is_read'    => (bool) $n->is_read,
                    'created_at' => $n->created_at->toDateTimeString(),
                ]),
            ],
            'meta' => [
                'total'        => $notifications->total(),
                'per_page'     => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     *
     * Mark a single notification as read.
     */
    public function markRead(Request $request, int $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * POST /api/notifications/read-all
     *
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }
}
