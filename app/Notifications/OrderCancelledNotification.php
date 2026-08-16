<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCancelledNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $customerName = $this->order->customer?->first_name ?? $this->order->customer?->user?->name ?? 'Customer';

        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'grand_total'  => (float) $this->order->grand_total,
            'customer_name'=> $customerName,
            'message'      => "Order #{$this->order->order_number} was cancelled by customer ({$customerName}) — PKR " . number_format($this->order->grand_total, 2),
            'action_url'   => '/admin/orders/' . $this->order->id,
        ];
    }
}
