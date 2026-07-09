<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class SequenceGenerator
{
    /**
     * Atomically increment and return the next value for the given sequence key.
     * Uses SELECT FOR UPDATE to prevent race conditions under concurrent requests.
     *
     * @param  string  $key  The sequence key (e.g. 'order_number')
     * @return int           The next sequential value
     */
    public static function next(string $key): int
    {
        return DB::transaction(function () use ($key) {
            $row = DB::table('sequences')
                ->where('key', $key)
                ->lockForUpdate()
                ->first();

            if (! $row) {
                // Auto-create with default start if somehow missing
                DB::table('sequences')->insert(['key' => $key, 'value' => 50000]);
                $next = 50001;
            } else {
                $next = $row->value + 1;
            }

            DB::table('sequences')
                ->where('key', $key)
                ->update(['value' => $next]);

            return $next;
        });
    }
}
