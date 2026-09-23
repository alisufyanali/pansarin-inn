<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyPointTransaction extends Model
{
    protected $table = 'point_transactions';

    protected $fillable = [
        'customer_id',
        'points',
        'type',
        'reason',
        'reference',
    ];

    protected $attributes = [
        'type' => 'earned',
    ];

    protected $casts = [
        'points' => 'integer',
        'type' => 'string',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
