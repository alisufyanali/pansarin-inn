<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;


class NotificationController extends Controller
{
     // Get all notifications
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    // Get unread notifications (for dropdown)
    public function unread(Request $request)
    {
        return response()->json([
            'notifications' => $request->user()
                ->unreadNotifications()
                ->latest()
                ->limit(5)
                ->get(),
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    // Mark as read
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        $notification->markAsRead();

        return back();
    }

    // Mark all as read
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        
        return back();
    }

    // Delete notification
    public function destroy(Request $request, $id)
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return back();
    }
}
