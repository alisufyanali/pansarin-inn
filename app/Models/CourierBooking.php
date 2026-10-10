<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One courier booking attempt — see the courier_bookings migration. */
class CourierBooking extends Model
{
    protected $fillable = [
        'order_id', 'sale_id', 'courier', 'status', 'tracking_number', 'destination_city',
        'message', 'http_status', 'request', 'response', 'user_id',
    ];

    protected $casts = [
        'request'  => 'array',
        'response' => 'array',
    ];

    /** Couriers that book through an API; the rest are arranged by hand */
    public const API_COURIERS = ['leopard' => 'Leopards', 'px' => 'PostEx', 'movex' => 'Movex'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function isBooked(): bool
    {
        return $this->status === 'booked';
    }

    public function courierName(): string
    {
        return self::API_COURIERS[$this->courier] ?? $this->courier;
    }
}
