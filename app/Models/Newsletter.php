<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Newsletter extends Model
{
    protected $fillable = [
        'email',
        'name',
        'status',
        'verification_token',
        'verified_at',
        'source',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($newsletter) {
            if (!$newsletter->verification_token) {
                $newsletter->verification_token = Str::random(64);
            }
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    // Helper Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    public function verify(): void
    {
        $this->update([
            'verified_at' => now(),
            'verification_token' => null,
        ]);
    }
}