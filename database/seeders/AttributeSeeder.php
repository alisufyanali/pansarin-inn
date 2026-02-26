<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    public function run()
    {
        // ─────────────────────────────────────────
        // Category IDs fetch karo slug se
        // (ID hardcode mat karo — future proof)
        // ─────────────────────────────────────────
        $herbal       = Category::where('slug', 'herbal')->first();
        $oils         = Category::where('slug', 'oils')->first();
        $supplements  = Category::where('slug', 'supplements')->first();
        $beauty       = Category::where('slug', 'beauty-corner')->first();
        $dawakhana    = Category::where('slug', 'dawakhana')->first();

        // ═══════════════════════════════════════════
        // 1. HERBAL — Weight + Form + Quantity
        // ═══════════════════════════════════════════
        if ($herbal) {

            // ── Weight (grams) ──
            $herbalWeight = Attribute::firstOrCreate(
                ['category_id' => $herbal->id, 'slug' => 'weight'],
                ['name' => 'Weight']
            );
            $herbalWeights = [
                ['value' => '50 gm',  'slug' => '50gm'],
                ['value' => '100 gm', 'slug' => '100gm'],
                ['value' => '250 gm', 'slug' => '250gm'],
                ['value' => '500 gm', 'slug' => '500gm'],
            ];
            foreach ($herbalWeights as $w) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $herbalWeight->id, 'value' => $w['value']],
                    ['slug' => $w['slug']]
                );
            }

            // ── Form (Whole / Powder) ──
            $herbalForm = Attribute::firstOrCreate(
                ['category_id' => $herbal->id, 'slug' => 'form'],
                ['name' => 'Form']
            );
            $herbalForms = [
                ['value' => 'Whole',  'slug' => 'whole'],
                ['value' => 'Powder', 'slug' => 'powder'],
            ];
            foreach ($herbalForms as $f) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $herbalForm->id, 'value' => $f['value']],
                    ['slug' => $f['slug']]
                );
            }

            // ── Quantity ──
            $herbalQty = Attribute::firstOrCreate(
                ['category_id' => $herbal->id, 'slug' => 'quantity'],
                ['name' => 'Quantity']
            );
            foreach ($this->quantities() as $q) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $herbalQty->id, 'value' => $q['value']],
                    ['slug' => $q['slug']]
                );
            }
        }

        // ═══════════════════════════════════════════
        // 2. OILS — Pack (ml) + Quantity
        // ═══════════════════════════════════════════
        if ($oils) {

            // ── Pack Size ──
            $oilsPack = Attribute::firstOrCreate(
                ['category_id' => $oils->id, 'slug' => 'pack'],
                ['name' => 'Pack']
            );
            $oilsPacks = [
                ['value' => '30 ml',  'slug' => '30ml'],
                ['value' => '60 ml',  'slug' => '60ml'],
                ['value' => '100 ml', 'slug' => '100ml'],
                ['value' => '120 ml', 'slug' => '120ml'],
                ['value' => '200 ml', 'slug' => '200ml'],
                ['value' => '500 ml', 'slug' => '500ml'],
                ['value' => '1 L',    'slug' => '1l'],
            ];
            foreach ($oilsPacks as $p) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $oilsPack->id, 'value' => $p['value']],
                    ['slug' => $p['slug']]
                );
            }

            // ── Quantity ──
            $oilsQty = Attribute::firstOrCreate(
                ['category_id' => $oils->id, 'slug' => 'quantity'],
                ['name' => 'Quantity']
            );
            foreach ($this->quantities() as $q) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $oilsQty->id, 'value' => $q['value']],
                    ['slug' => $q['slug']]
                );
            }
        }

        // ═══════════════════════════════════════════
        // 3. SUPPLEMENTS — Weight + Quantity
        // ═══════════════════════════════════════════
        if ($supplements) {

            // ── Weight ──
            $suppWeight = Attribute::firstOrCreate(
                ['category_id' => $supplements->id, 'slug' => 'weight'],
                ['name' => 'Weight']
            );
            $suppWeights = [
                ['value' => '50 gm',  'slug' => '50gm'],
                ['value' => '100 gm', 'slug' => '100gm'],
                ['value' => '200 gm', 'slug' => '200gm'],
                ['value' => '500 gm', 'slug' => '500gm'],
            ];
            foreach ($suppWeights as $w) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $suppWeight->id, 'value' => $w['value']],
                    ['slug' => $w['slug']]
                );
            }

            // ── Quantity ──
            $suppQty = Attribute::firstOrCreate(
                ['category_id' => $supplements->id, 'slug' => 'quantity'],
                ['name' => 'Quantity']
            );
            foreach ($this->quantities() as $q) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $suppQty->id, 'value' => $q['value']],
                    ['slug' => $q['slug']]
                );
            }
        }

        // ═══════════════════════════════════════════
        // 4. BEAUTY CORNER — Weight + Quantity
        // ═══════════════════════════════════════════
        if ($beauty) {

            // ── Weight ──
            $beautyWeight = Attribute::firstOrCreate(
                ['category_id' => $beauty->id, 'slug' => 'weight'],
                ['name' => 'Weight']
            );
            $beautyWeights = [
                ['value' => '50 gm',  'slug' => '50gm'],
                ['value' => '100 gm', 'slug' => '100gm'],
                ['value' => '200 gm', 'slug' => '200gm'],
                ['value' => '500 gm', 'slug' => '500gm'],
            ];
            foreach ($beautyWeights as $w) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $beautyWeight->id, 'value' => $w['value']],
                    ['slug' => $w['slug']]
                );
            }

            // ── Quantity ──
            $beautyQty = Attribute::firstOrCreate(
                ['category_id' => $beauty->id, 'slug' => 'quantity'],
                ['name' => 'Quantity']
            );
            foreach ($this->quantities() as $q) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $beautyQty->id, 'value' => $q['value']],
                    ['slug' => $q['slug']]
                );
            }
        }

        // ═══════════════════════════════════════════
        // 5. DAWAKHANA — Sirf Quantity
        // ═══════════════════════════════════════════
        if ($dawakhana) {

            $dawakhanaQty = Attribute::firstOrCreate(
                ['category_id' => $dawakhana->id, 'slug' => 'quantity'],
                ['name' => 'Quantity']
            );
            foreach ($this->quantities() as $q) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $dawakhanaQty->id, 'value' => $q['value']],
                    ['slug' => $q['slug']]
                );
            }
        }

        $this->command->info('✅ Attributes and values seeded successfully!');
    }

    // ─────────────────────────────────────────
    // Shared Quantity values (sab categories mein same)
    // ─────────────────────────────────────────
    private function quantities(): array
    {
        return [
            ['value' => '1',  'slug' => 'qty-1'],
            ['value' => '2',  'slug' => 'qty-2'],
            ['value' => '3',  'slug' => 'qty-3'],
            ['value' => '5',  'slug' => 'qty-5'],
            ['value' => '10', 'slug' => 'qty-10'],
        ];
    }
}