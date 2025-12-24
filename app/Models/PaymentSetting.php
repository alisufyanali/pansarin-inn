<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'cod','stripe_key','stripe_secret','paypal_client_id','paypal_secret'
    ];
}
