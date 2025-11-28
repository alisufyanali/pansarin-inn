<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class OrderShipped extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public $order,
        public $message = 'Your order has been shipped!'
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
            'order_id' => $this->order->id ?? null,
            'type' => 'order_shipped',
            'action_url' => '1',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return [
            'message' => $this->message,
            'order_id' => $this->order->id ?? null,
            'type' => 'order_shipped',
            'action_url' => '1',
        ];
    }
}