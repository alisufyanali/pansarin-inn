<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'site_name','site_logo','email','phone','address','timezone','currency'
    ];
}
