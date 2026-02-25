<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('affiliate_code')->unique();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('affiliates')->onDelete('set null');
            $table->decimal('commission_rate', 5, 2)->default(5.00);
            $table->enum('status', ['pending', 'active', 'blocked'])->default('pending');

        $table->decimal('balance', 10, 2)->default(0.00); // Current earning
        $table->string('payment_method')->nullable(); // Bank, JazzCash, Easypaisa
        $table->string('payment_account_title')->nullable(); // Account Title
        $table->string('payment_iban_details')->nullable(); // Account IBAN number for reduce risk
        $table->text('payment_account_no_details')->nullable(); // Account number

            $table->timestamp('joined_at')->nullable();
            $table->foreignId('approved_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};
