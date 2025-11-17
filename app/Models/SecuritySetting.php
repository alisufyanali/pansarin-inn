<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecuritySetting extends Model
{
    protected $fillable = [
        'recaptcha_enabled','recaptcha_site_key','recaptcha_secret_key',
        'two_factor_enabled'
    ];
}

