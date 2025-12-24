<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'file_name','file_type','path','user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

