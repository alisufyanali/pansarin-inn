<?php

// app/Models/WhatsappMessage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    protected $fillable = [
        'wa_message_id',
        'from_number',
        'contact_name',
        'type',
        'message',
        'media_url',
        'is_read',
        'received_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'received_at' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeFromNumber($query, $phone)
    {
        $cleanPhone = preg_replace('/\D+/', '', $phone);

        return $query->whereRaw("REPLACE(REPLACE(REPLACE(from_number, '-', ''), ' ', ''), '+', '') = ?", [$cleanPhone]);
    }
}
