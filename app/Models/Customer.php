<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id','address','city','country'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
