<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FrontendContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'image',
        'title',
        'order',
        'is_active',
        'link',
        'description',
    ];
}
