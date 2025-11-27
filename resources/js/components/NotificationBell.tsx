
import { useState, useEffect, useRef, FC } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import type { Notification as NotificationType, NotificationResponse } from '@/types/notification';
import type { PageProps } from '@/types';

interface NotificationBellProps {
    unreadCount: number;
}

const NotificationBell: FC<NotificationBellProps> = ({ unreadCount: initialCount }) => {
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(initialCount);
    const [loading, setLoading] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { auth } = usePage<PageProps>().props;

    // Initialize notification sound
    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.mp3');
    }, []);

    // Request desktop notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Listen to real-time notifications via Laravel Echo
    useEffect(() => {
        if (window.Echo && auth?.user?.id) {
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            
            channel.notification((notification: any) => {
                console.log('🔔 New notification received:', notification);
                
                // Update count
                setUnreadCount(prev => prev + 1);
                
                // Add to list
                setNotifications(prev => [
                    {
                        id: notification.id,
                        type: notification.type,
                        notifiable_id: auth.user.id,
                        notifiable_type: 'App\\Models\\User',
                        data: notification,
                        read_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as NotificationType,
                    ...prev.slice(0, 4)
                ]);
                
                // Play sound
                playNotificationSound();
                
                // Show toast
                showToast(notification.message || 'You have a new notification');
                
                // Show desktop notification
                showDesktopNotification(
                    notification.message || 'New Notification',
                    notification.action_url
                );
            });

            return () => {
                channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            };
        }
    }, [auth?.user?.id]);

    // Removed auto-refresh - only updates on real-time notifications

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    const fetchNotifications = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await axios.get<NotificationResponse>('/notifications/unread');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string): Promise<void> => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async (): Promise<void> => {
        try {
            await axios.post('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = (notification: NotificationType): void => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
            setShowDropdown(false);
        }
    };

    const playNotificationSound = (): void => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => {
                console.error('Error playing sound:', err);
            });
        }
    };

    const showToast = (message: string): void => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                New Notification
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-right',
        });
    };

    const showDesktopNotification = (message: string, actionUrl?: string): void => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New Notification', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'notification',
                requireInteraction: false,
            });

            notification.onclick = () => {
                window.focus();
                if (actionUrl) {
                    router.visit(actionUrl);
                }
                notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {/* Toast Container */}
            <Toaster position="top-right" />

            <div className="relative" ref={dropdownRef}>
                {/* Bell Icon */}
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-colors"
                    aria-label="Notifications"
                >
                    {/* Animated bell icon when there are unread notifications */}
                    <svg
                        className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    {/* Badge with pulse animation */}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-gray-500">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <p className="mt-2 text-gray-500">No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.read_at ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {notification.data.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(notification.created_at)}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <div className="ml-2 flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                            <Link
                                href="/notifications"
                                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationBell;