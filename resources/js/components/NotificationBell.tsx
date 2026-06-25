import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { echo } from '@/echo';
import { router } from '@inertiajs/react';

interface Notification {
    id: string;
    type: string;
    data: { message: string; action_url?: string };
    read_at: string | null;
    created_at: string;
}

interface Props {
    auth: { user: { id: number; unread_notifications_count: number } };
}

export default function NotificationBell({ auth }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(auth.user.unread_notifications_count || 0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUVE=');
    }, []);

    const playSound = () => { audioRef.current?.play().catch(() => {}); };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get<{ notifications: Notification[]; count: number }>('/admin/notifications/unread');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        if (!auth?.user?.id) return;

        fetchNotifications();

        const channel = echo.private(`App.Models.User.${auth.user.id}`);
        channel.notification((payload: any) => {
            const newNotification: Notification = {
                id: payload.id || Date.now().toString(),
                type: payload.type || 'default',
                data: payload,
                read_at: null,
                created_at: new Date().toISOString(),
            };
            setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
            setUnreadCount(prev => prev + 1);

            playSound();
            toast.success(payload.message || 'New notification', { icon: '🔔', duration: 4000 });
        });

        return () => { echo.leave(`App.Models.User.${auth.user.id}`); };
    }, [auth?.user?.id]);

    const markAsRead = async (notificationId: string) => {
        try {
            await axios.post(`/admin/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/admin/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button - Fixed dark mode */}
            <button
                className="relative p-2 rounded-full transition-colors
                    text-gray-600 hover:text-gray-900 hover:bg-gray-100
                    dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Notifications"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                        bg-red-600 text-white
                        dark:bg-red-500 dark:text-red-50">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel - Fixed dark mode */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 z-50 rounded-lg shadow-xl border overflow-hidden
                    bg-white border-gray-200
                    dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50">

                    {/* Header - Fixed dark mode */}
                    <div className="p-3 border-b flex justify-between items-center
                        bg-white border-gray-200
                        dark:bg-gray-800 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm font-medium transition-colors
                                    text-blue-600 hover:text-blue-800 hover:underline
                                    dark:text-blue-400 dark:hover:text-blue-300">
                                Mark All Read
                            </button>
                        )}
                    </div>

                    {/* Notifications List - Fixed dark mode */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No notifications
                            </p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-3 border-b cursor-pointer transition-colors
                                        border-gray-100 dark:border-gray-700
                                        ${!n.read_at
                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    onClick={() => {
                                        if (!n.read_at) markAsRead(n.id);
                                        if (n.data.action_url) router.visit(n.data.action_url);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        {!n.read_at && (
                                            <span className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0
                                                bg-blue-500 dark:bg-blue-400">
                                            </span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.read_at
                                                ? 'font-semibold text-gray-900 dark:text-gray-100'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {n.data.message}
                                            </p>
                                            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                                {formatTime(n.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Fixed dark mode */}
                    {notifications.length > 0 && (
                        <div className="p-2 border-t text-center
                            border-gray-200 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => {
                                    router.visit('/admin/notifications');
                                    setShowDropdown(false);
                                }}
                                className="text-sm font-medium transition-colors
                                    text-blue-600 hover:text-blue-800
                                    dark:text-blue-400 dark:hover:text-blue-300">
                                View All Notifications →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};