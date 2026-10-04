<?php

namespace App\Notifications;

use App\Models\WhatsappMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class WhatsAppMessageReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(public WhatsappMessage $message) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $from = $this->message->contact_name ?: '+' . $this->message->from_number;

        return [
            'whatsapp_message_id' => $this->message->id,
            'from_number'         => $this->message->from_number,
            'message'             => "New WhatsApp message from {$from}: \"" . Str::limit((string) $this->message->message, 80) . '"',
            'action_url'          => '/admin/whatsapp/chat',
        ];
    }
}
