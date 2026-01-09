<?php

namespace App\Listeners;

use App\Events\LowStockAlert;
use App\Notifications\LowStockNotification;
use App\Models\User;

class SendLowStockNotification
{
    public function handle(LowStockAlert $event)
    {
        // Get all admin users
        $admins = User::role('admin')->get(); // If using Spatie permissions
        
        foreach ($admins as $admin) {
            $admin->notify(new LowStockNotification($event->product));
        }
    }
}