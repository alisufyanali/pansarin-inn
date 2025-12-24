<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $fillable = [
        'affiliate_id','order_id','user_id','commission'
    ];

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }
}
