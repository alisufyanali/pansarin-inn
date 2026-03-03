<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id', 'owner_type', 'provider', 'account_name', 'account_number', 'is_primary'
    ];

    public function owner() { return $this->morphTo(); }
}