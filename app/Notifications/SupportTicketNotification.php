<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SupportTicketNotification extends Notification
{
    use Queueable;

    public function __construct(public Ticket $ticket) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $customerName = $this->ticket->user?->name ?? 'Customer';

        return [
            'ticket_id'  => $this->ticket->id,
            'subject'    => $this->ticket->subject,
            'user_id'    => $this->ticket->user_id,
            'user_name'  => $customerName,
            'message'    => "New support ticket from {$customerName}: \"{$this->ticket->subject}\"",
            'action_url' => '/admin',
        ];
    }
}
