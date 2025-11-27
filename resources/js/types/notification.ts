export interface NotificationData {
    message: string;
    type: string;
    action_url?: string;
    order_id?: number;
    [key: string]: any;
}

export interface Notification {
    id: string;
    type: string;
    notifiable_id: number;
    notifiable_type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    count: number;
}

export interface PaginatedNotifications {
    data: Notification[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}