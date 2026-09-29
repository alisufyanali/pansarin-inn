<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Production safety: must_change_password + phone were added only by editing
 * the original create_users migration, which never re-runs on an existing DB.
 * This migration adds them where missing. Guarded with hasColumn so it is a
 * no-op on fresh installs where the create migration already added them.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('phone')->nullable()->unique()->after('email');
            });
        }

        if (! Schema::hasColumn('users', 'must_change_password')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('must_change_password')->default(false);
            });
        }
    }

    public function down(): void
    {
        // Intentionally not dropping: on fresh installs these columns belong to
        // the create_users migration, and dropping here would break it.
    }
};
