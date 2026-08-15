<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewNewsletterSubscriberNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $email,
        public ?string $name = null,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $display = $this->name ? "{$this->name} ({$this->email})" : $this->email;

        return [
            'email'      => $this->email,
            'name'       => $this->name,
            'message'    => "New newsletter subscriber: {$display}",
            'action_url' => '/admin/newsletters',
        ];
    }
}
