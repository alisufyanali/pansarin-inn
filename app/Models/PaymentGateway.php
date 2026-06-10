<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = ['name', 'slug', 'credentials', 'is_active'];

    protected $casts = ['credentials' => 'array'];
}
