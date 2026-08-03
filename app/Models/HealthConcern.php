<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HealthConcern extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'status'     => 'boolean',
        'sort_order' => 'integer',
    ];

    // ── Relationships ──────────────────────────────────────────────

    public function products(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_health_concern');
    }

    // ── Scopes ─────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
