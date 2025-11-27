<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderShipped extends Notification
{
    use Queueable;

    public function __construct(
        public $order,
        public $message = 'Your order has been shipped!'
    ) {}

    // Store in database
    public function via($notifiable): array
    {
        return ['database', 'broadcast']; // database + real-time
    }

    // Database notification structure
    public function toArray($notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'message' => $this->message,
            'type' => 'order_shipped',
        ];
    }

    // Broadcasting (for real-time)
    public function toBroadcast($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'message' => $this->message,
            'type' => 'order_shipped',
        ];
    }
}