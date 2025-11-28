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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUVE=');
    }, []);

    const playSound = () => { audioRef.current?.play().catch(() => {}); };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get<{ notifications: Notification[]; count: number }>('/notifications/unread');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        if (!auth?.user?.id) return;

        fetchNotifications(); // initial fetch

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

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <div className="relative">
            <button
                className="relative p-2 text-gray-600 hover:text-gray-900"
                onClick={() => { setShowDropdown(!showDropdown); }}
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg border z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">
                                Mark All Read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read_at ? 'bg-blue-50' : ''}`}
                                    onClick={() => n.data.action_url && router.visit(n.data.action_url)}
                                >
                                    <p className="text-sm font-medium">{n.data.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
