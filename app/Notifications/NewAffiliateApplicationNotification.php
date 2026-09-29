<?php

namespace App\Notifications;

use App\Models\Affiliate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewAffiliateApplicationNotification extends Notification
{
    use Queueable;

    public function __construct(public Affiliate $affiliate) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $name = $this->affiliate->user?->name ?? 'Someone';

        return [
            'affiliate_id' => $this->affiliate->id,
            'user_id'      => $this->affiliate->user_id,
            'user_name'    => $name,
            'message'      => "New affiliate application from {$name} — waiting for approval",
            'action_url'   => '/admin/affiliates',
        ];
    }
}
