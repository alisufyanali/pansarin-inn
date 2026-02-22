<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    protected $fillable = ['affiliate_id', 'amount', 'status', 'transaction_id', 'admin_note'];

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }
}
