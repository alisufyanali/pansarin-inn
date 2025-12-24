<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('security_settings', function (Blueprint $table) {
    $table->id();
    $table->boolean('recaptcha_enabled')->default(false);
    $table->string('recaptcha_site_key')->nullable();
    $table->string('recaptcha_secret_key')->nullable();
    $table->boolean('two_factor_enabled')->default(false);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_settings');
    }
};
