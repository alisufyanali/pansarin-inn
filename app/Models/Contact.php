<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'admin_reply',
        'replied_at',
        'replied_by',
        'ip_address',
        'user_agent',
        'referrer',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function repliedByUser()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    /**
     * Scopes
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    public function scopeReplied($query)
    {
        return $query->where('status', 'replied');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Mark as read
     */
    public function markAsRead()
    {
        if ($this->status === 'new') {
            $this->update(['status' => 'read']);
        }
    }

    /**
     * Mark as replied
     */
    public function markAsReplied($reply, $userId)
    {
        $this->update([
            'status' => 'replied',
            'admin_reply' => $reply,
            'replied_at' => now(),
            'replied_by' => $userId,
        ]);
    }

    /**
     * Mark as resolved
     */
    public function markAsResolved()
    {
        $this->update(['status' => 'resolved']);
    }

    /**
     * Mark as spam
     */
    public function markAsSpam()
    {
        $this->update(['status' => 'spam']);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return [
            'new' => 'blue',
            'read' => 'yellow',
            'replied' => 'green',
            'resolved' => 'gray',
            'spam' => 'red',
        ][$this->status] ?? 'gray';
    }
}