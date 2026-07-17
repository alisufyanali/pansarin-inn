<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = [
        'customer_id',
        'points',
        'type',       // earned | redeemed | admin_adjustment
        'reason',
        'reference',  // order_number or admin note
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}

