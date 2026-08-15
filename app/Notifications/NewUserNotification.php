<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewUserNotification extends Notification
{
    use Queueable;

    public function __construct(public User $user) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'user_id'    => $this->user->id,
            'name'       => $this->user->name,
            'email'      => $this->user->email,
            'phone'      => $this->user->phone,
            'message'    => "New customer registered: {$this->user->name} ({$this->user->email})",
            'action_url' => '/admin/customers',
        ];
    }
}
