<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'grand_total'  => (float) $this->order->grand_total,
            'message'      => "New order placed: {$this->order->order_number} — PKR " . number_format($this->order->grand_total, 2),
            'action_url'   => '/admin/orders/' . $this->order->id,
        ];
    }
}
