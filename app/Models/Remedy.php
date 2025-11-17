<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Remedy extends Model
{
    protected $fillable = [
        'title','slug','description','image'
    ];
}
