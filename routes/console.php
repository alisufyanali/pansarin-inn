<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Prune expired Sanctum tokens daily (removes tokens older than 168 hours / 7 days)
Schedule::command('sanctum:prune-expired --hours=168')->daily();
