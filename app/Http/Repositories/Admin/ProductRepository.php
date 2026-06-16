<?php

namespace App\Http\Repositories\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductStock;
use App\Models\Inventory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProductRepository
{
    public function getAll()
    {
        return Product::with('category')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Product::with('category:id,name')
            ->select('id', 'name', 'sku', 'price', 'sale_price', 'purchase_price_per_unit',
                     'sale_price_per_unit', 'quantity', 'unit', 'status', 'featured',
                     'category_id', 'thumbnail', 'created_at', 'updated_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status'))   $query->where('status',   $request->status   === 'active');
        if ($request->filled('featured')) $query->where('featured', $request->featured  === 'yes');

        $query->orderBy($request->get('sortBy', 'created_at'), $request->get('sortOrder', 'desc'));

        $products = $query->paginate($request->get('perPage', 10), ['*'], 'page', $request->get('page', 1));

        return response()->json([
            'data'         => $products->map(fn ($p) => [
                'id'                      => $p->id,
                'name'                    => $p->name,
                'sku'                     => $p->sku,
                'price'                   => $p->price,
                'sale_price'              => $p->sale_price,
                'purchase_price_per_unit' => $p->purchase_price_per_unit,
                'sale_price_per_unit'     => $p->sale_price_per_unit,
                'quantity'                => $p->quantity,
                'unit'                    => $p->unit,
                'status'                  => $p->status,
                'featured'                => $p->featured,
                'category_id'             => $p->category_id,
                'category'                => $p->category,
                // ── Thumbnail: simple asset() — no finfo needed ──
                'thumbnail_url'           => $p->thumbnail
                                                ? asset('storage/' . $p->thumbnail)
                                                : null,
                'created_at'              => $p->created_at,
                'updated_at'              => $p->updated_at,
            ]),
            'total'        => $products->total(),
            'per_page'     => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page'    => $products->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Product::with(['variants'])->findOrFail($id);
    }

    private function productFolder(int $id, string $name): string
    {
        $slug = Str::slug($name);
        return "products/{$id}-{$slug}";
    }

    public function store(array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        Cache::forget('product_stats');
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        $variants = $data['variations'] ?? [];
        unset($data['variations'], $data['selected_attributes']);

        $product = Product::create($data);
        $folder  = $this->productFolder($product->id, $product->name);
        $slug    = $product->slug;

        if ($thumbnailFile) {
            $product->thumbnail = $this->moveUploadedFile($thumbnailFile, $folder, $slug);
            $product->save();
        }

        if ($socialImageFile) {
            $product->social_image = $this->moveUploadedFile($socialImageFile, "{$folder}/social", $slug);
            $product->save();
        }

        if (!empty($galleryFiles)) {
            $galleryPaths = [];
            foreach ($galleryFiles as $index => $file) {
                $galleryPaths[] = $this->moveUploadedFile($file, "{$folder}/gallery", $slug . '-' . ($index + 1));
            }
            $product->gallery = $galleryPaths;
            $product->save();
        }

        if (!empty($variants)) {
            foreach ($variants as $index => $variant) {
                $pv = ProductVariant::create([
                    'product_id'         => $product->id,
                    'sku'                => $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'attribute_value_id' => null,
                    'value'              => $variant['combination'] ?? '',
                    'attributes'         => $variant['attributes'] ?? [],
                    'additional'         => (int) ($variant['additional'] ?? 0),
                    'price'              => (float) ($variant['purchase_price'] ?? 0),
                    'sale_price'         => !empty($variant['sale_price']) ? (float) $variant['sale_price'] : null,
                    'stock_alert'        => (int) ($variant['stock_alert'] ?? 5),
                    'is_default'         => ($index === 0),
                    'status'             => true,
                ]);

                $qty = (float) ($variant['current_stock'] ?? 0);
                if ($qty > 0) {
                    $this->syncVariantStock($product->id, $pv->id, $qty);
                }
            }
        }

        return $product;
    }

    public function update($id, array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        $product = $this->find($id);
        $folder  = $this->productFolder($product->id, $data['name'] ?? $product->name);
        $slug    = $data['slug'] ?? $product->slug;

        if (isset($data['name']) && $data['name'] !== $product->name && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
            $slug = $data['slug'];
        }

        if ($thumbnailFile) {
            if ($product->thumbnail) $this->deleteUploadedFile($product->thumbnail);
            $data['thumbnail'] = $this->moveUploadedFile($thumbnailFile, $folder, $slug);
        } else {
            unset($data['thumbnail']);
        }

        if ($socialImageFile) {
            if ($product->social_image) $this->deleteUploadedFile($product->social_image);
            $data['social_image'] = $this->moveUploadedFile($socialImageFile, "{$folder}/social", $slug);
        } else {
            unset($data['social_image']);
        }

        if (!empty($galleryFiles)) {
            if ($product->gallery && is_array($product->gallery)) {
                foreach ($product->gallery as $old) $this->deleteUploadedFile($old);
            }
            $galleryPaths = [];
            foreach ($galleryFiles as $index => $file) {
                $galleryPaths[] = $this->moveUploadedFile($file, "{$folder}/gallery", $slug . '-' . ($index + 1));
            }
            $data['gallery'] = $galleryPaths;
        } else {
            unset($data['gallery']);
        }

        $variants = $data['variations'] ?? [];
        unset($data['variations'], $data['selected_attributes']);

        $product->update($data);

        if (!empty($variants)) {
            // Force delete (not soft delete) to avoid SKU unique constraint on re-insert
            $product->variants()->forceDelete();
            foreach ($variants as $index => $variant) {
                // Generate unique SKU using timestamp to avoid conflicts
                $sku = $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT);
                // If SKU still exists (edge case), make it unique
                if (ProductVariant::withTrashed()->where('sku', $sku)->exists()) {
                    $sku = $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT) . '-' . time();
                }
                $pv = ProductVariant::create([
                    'product_id'         => $product->id,
                    'sku'                => $sku,
                    'attribute_value_id' => null,
                    'value'              => $variant['combination'] ?? '',
                    'attributes'         => $variant['attributes'] ?? [],
                    'additional'         => (int) ($variant['additional'] ?? 0),
                    'price'              => (float) ($variant['purchase_price'] ?? 0),
                    'sale_price'         => !empty($variant['sale_price']) ? (float) $variant['sale_price'] : null,
                    'stock_alert'        => (int) ($variant['stock_alert'] ?? 5),
                    'is_default'         => ($index === 0),
                    'status'             => true,
                ]);

                $qty = (float) ($variant['current_stock'] ?? 0);
                $this->syncVariantStock($product->id, $pv->id, $qty);
            }
        }

        return $product;
    }

    public function delete($id)
    {
        Cache::forget('product_stats');
        $product = $this->find($id);
        $folder  = public_path('storage/' . $this->productFolder($product->id, $product->name));

        // Delete entire product folder
        if (is_dir($folder)) {
            $this->deleteDirectory($folder);
        }

        return $product->delete();
    }

    public function getStats()
    {
        return Cache::remember('product_stats', 300, function () {
            $counts = Product::selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured
            ")->first();

            $onSale = \DB::table('product_variants')
                ->whereNotNull('sale_price')
                ->where('sale_price', '>', 0)
                ->whereColumn('sale_price', '<', 'price')
                ->distinct('product_id')
                ->count('product_id');

            return [
                'total'    => (int) $counts->total,
                'active'   => (int) $counts->active,
                'featured' => (int) $counts->featured,
                'onSale'   => (int) $onSale,
            ];
        });
    }

    /**
     * Sync opening/updated stock for a variant via the Inventory model.
     * Reuses Inventory model's booted events (same path as InventoryRepository::store).
     * On update: replaces ProductStock quantity to match the new desired total,
     * then writes a correcting Inventory ledger entry.
     */
    private function syncVariantStock(int $productId, int $variantId, float $desiredQty): void
    {
        $existing = ProductStock::where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();

        $currentQty = $existing ? (float) $existing->quantity : 0.0;
        $diff = $desiredQty - $currentQty;

        if ($diff == 0) return;

        // Write Inventory ledger entry (type=in or adjustment) — model booted event
        // will automatically update ProductStock via adjustStock().
        Inventory::create([
            'product_id'         => $productId,
            'product_variant_id' => $variantId,
            'type'               => $diff > 0 ? 'in' : 'adjustment',
            'quantity'           => $diff,
            'source'             => 'product_form',
            'note'               => 'Stock set from product create/edit form',
        ]);
    }

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug     = $baseSlug;
        $counter  = 1;

        while (
            Product::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter++;
        }

        return $slug;
    }

    /**
     * Move uploaded file to public/storage/{folder}/{slug}.{ext}
     * Returns relative path e.g. "products/6-my-product/my-product.jpg"
     */
    private function moveUploadedFile($file, string $folder, string $slug): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::slug($slug) . '.' . $extension;
        $directory = public_path('storage/' . $folder);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return $folder . '/' . $filename;
    }

    /**
     * Delete a single file stored via moveUploadedFile()
     */
    private function deleteUploadedFile(string $relativePath): void
    {
        $fullPath = public_path('storage/' . $relativePath);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    /**
     * Recursively delete a directory and all its contents
     */
    private function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) return;

        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $dir . DIRECTORY_SEPARATOR . $item;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }
}