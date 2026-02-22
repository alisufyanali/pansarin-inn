<?php

// app/Models/WhatsappMessageLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMessageLog extends Model
{
    protected $fillable = [
        'phone',
        'customer_name',
        'order_id',
        'order_total',
        'delivery_address',
        'messages',
        'api_response',
    ];

    protected $casts = [
        'order_total' => 'decimal:2',
    ];

    public function scopeForPhone($query, $phone)
    {
        $cleanPhone = preg_replace('/\D+/', '', $phone);

        return $query->whereRaw("REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+', '') = ?", [$cleanPhone]);
    }
}
