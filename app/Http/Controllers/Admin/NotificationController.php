<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.notifications')->only(['index', 'unread']);
        $this->middleware('permission:delete.notifications')->only(['destroy']);
    }

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
    // public function unread(Request $request)
    // {
    //     return response()->json([
    //         'notifications' => $request->user()
    //             ->unreadNotifications()
    //             ->latest()
    //             ->limit(5)
    //             ->get(),
    //         'count' => $request->user()->unreadNotifications()->count(),
    //     ]);
    // }

    /** Polled by the admin bell every few seconds — count and latest 5 in SQL, not every row in memory */
    public function unread()
    {
        $user = auth()->user();

        return response()->json([
            'count'         => $user->unreadNotifications()->count(),
            'notifications' => $user->unreadNotifications()->limit(5)->get(),
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
