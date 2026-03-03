<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = ['customer_id', 'points', 'reason'];

    public function customer() { return $this->belongsTo(Customer::class); }
}
