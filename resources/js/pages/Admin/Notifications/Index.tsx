import { useState, FC } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps ,type BreadcrumbItem  } from '@/types';
import { Notification, PaginatedNotifications } from '@/types/notification';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';

interface NotificationsPageProps extends PageProps {
    notifications: PaginatedNotifications;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];


const Index: FC<NotificationsPageProps> = ({ auth, notifications: initialNotifications }) => {
    const [notificationList, setNotificationList] = useState<Notification[]>(
        initialNotifications.data
    );

    const markAsRead = async (notificationId: string): Promise<void> => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setNotificationList(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteNotification = async (notificationId: string): Promise<void> => {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await axios.delete(`/notifications/${notificationId}`);
            setNotificationList(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const markAllAsRead = async (): Promise<void> => {
        try {
            await axios.post('/notifications/read-all');
            setNotificationList(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const unreadCount = notificationList.filter(n => !n.read_at).length;

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        All Notifications
                                    </h2>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            {notificationList.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-16 w-16 text-gray-400"
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
                                    <p className="mt-4 text-gray-500 text-lg">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notificationList.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 rounded-lg border transition-all ${
                                                !notification.read_at
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        {!notification.read_at && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                        )}
                                                        <p className="font-medium text-gray-900">
                                                            {notification.data.message}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 ml-4">
                                                        {formatDate(notification.created_at)}
                                                    </p>

                                                    {notification.data.action_url && (
                                                        <Link
                                                            href={notification.data.action_url}
                                                            className="inline-block mt-2 ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View details →
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                                        >
                                                            Mark read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;