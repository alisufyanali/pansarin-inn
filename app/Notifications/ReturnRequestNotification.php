<?php

namespace App\Notifications;

use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReturnRequestNotification extends Notification
{
    use Queueable;

    public function __construct(public ReturnRequest $returnRequest) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $orderNumber  = $this->returnRequest->order?->order_number ?? 'N/A';
        $customerName = $this->returnRequest->user?->name ?? 'Customer';

        return [
            'return_request_id' => $this->returnRequest->id,
            'order_id'          => $this->returnRequest->order_id,
            'order_number'      => $orderNumber,
            'user_id'           => $this->returnRequest->user_id,
            'user_name'         => $customerName,
            'reason_category'   => $this->returnRequest->reason_category,
            'items_count'       => $this->returnRequest->items->count(),
            'message'           => "New return request for order {$orderNumber} from {$customerName} ({$this->returnRequest->items->count()} item(s)). Reason: {$this->returnRequest->reason_category}.",
            'action_url'        => '/admin/returns',
        ];
    }
}
