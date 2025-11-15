<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'order_id', 'amount', 'method', 'transaction_id', 'status'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
