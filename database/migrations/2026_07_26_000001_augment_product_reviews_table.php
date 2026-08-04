<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Augments the existing product_reviews table with:
 *  - title             : optional review headline
 *  - images            : JSON array of uploaded image paths
 *  - helpful_count     : upvote counter
 *  - admin_reply       : moderator response text
 *  - admin_replied_at  : timestamp of reply
 *  - deleted_at        : soft deletes
 *  - composite index on (product_id, status) for fast approved-reviews queries
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            // Add new columns after existing ones
            $table->string('title')->nullable()->after('order_number');
            $table->json('images')->nullable()->after('comment');
            $table->unsignedInteger('helpful_count')->default(0)->after('images');
            $table->text('admin_reply')->nullable()->after('helpful_count');
            $table->timestamp('admin_replied_at')->nullable()->after('admin_reply');
            $table->softDeletes(); // adds deleted_at

            // Composite index — speeds up the most common query:
            // WHERE product_id = ? AND status = 1
            $table->index(['product_id', 'status'], 'product_reviews_product_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropIndex('product_reviews_product_status_index');
            $table->dropSoftDeletes();
            $table->dropColumn([
                'title', 'images', 'helpful_count',
                'admin_reply', 'admin_replied_at',
            ]);
        });
    }
};
