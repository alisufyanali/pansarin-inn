<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('customer_group_id')->nullable()->constrained()->onDelete('set null');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone')->unique()->nullable();
            $table->string('address')->nullable();
            $table->string('address2')->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->string('country')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('dob')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('status')->default('active'); 
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('city_id')->references('id')->on('cities')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
