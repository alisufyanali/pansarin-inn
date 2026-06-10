<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyPoint extends Model
{
    protected $fillable = ['customer_id', 'balance'];

    public function customer() { return $this->belongsTo(Customer::class); }
}