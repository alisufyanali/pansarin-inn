<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Owner request 2026-10-07: Dry Fruits, Herbal Tea, Combo Deals and Honey as
 * storefront categories. An existing category with the same slug or name
 * (e.g. one the admin already made) is switched on rather than duplicated.
 * The storefront lists a category once it has an active product.
 */
return new class extends Migration
{
    /** slug => [name, other names it may already exist under, sort_order] */
    private const CATEGORIES = [
        'dry-fruits'  => ['Dry Fruits',  ['dry fruit', 'dryfruit', 'dryfruits', 'dry-fruit'], 4],
        'herbal-tea'  => ['Herbal Tea',  ['herbal teas', 'herbal-teas'], 7],
        'honey'       => ['Honey',       ['shehad'], 7],
        'combo-deals' => ['Combo Deals', ['combo deal', 'combo-deal', 'combos'], 10],
    ];

    public function up(): void
    {
        foreach (self::CATEGORIES as $slug => [$name, $aliases, $order]) {
            $names = array_map('strtolower', array_merge([$name, $slug], $aliases));

            $existing = DB::table('categories')
                ->where('slug', $slug)
                ->orWhereIn(DB::raw('LOWER(name)'), $names)
                ->orWhereIn('slug', $aliases)
                ->orderByRaw('slug = ? desc', [$slug])
                ->first();

            if ($existing) {
                DB::table('categories')->where('id', $existing->id)->update([
                    'status'     => true,
                    'sort_order' => $existing->sort_order == 99 ? $order : $existing->sort_order,
                    'updated_at' => now(),
                ]);
                continue;
            }

            DB::table('categories')->insert([
                'name'       => $name,
                'slug'       => $slug,
                'status'     => true,
                'sort_order' => $order,
                'parent_id'  => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Only remove the ones this migration made and that are still empty
        foreach (array_keys(self::CATEGORIES) as $slug) {
            $id = DB::table('categories')->where('slug', $slug)->value('id');
            if ($id && ! DB::table('products')->where('category_id', $id)->exists()) {
                DB::table('categories')->where('id', $id)->delete();
            }
        }
    }
};
