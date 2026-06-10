<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
        $table->id();
        $table->foreignId('affiliate_id')->constrained()->onDelete('cascade');
        
        $table->string('type'); // e.g., 'bank', 'easypaisa', 'jazzcash'
        $table->string('title'); // Account Title
        $table->string('account_number'); // Account or IBAN Number
        $table->string('bank_name')->nullable(); 
        $table->string('branch_code')->nullable();
        $table->boolean('is_default')->default(false); // Default payout method
        $table->softDeletes();
        $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
