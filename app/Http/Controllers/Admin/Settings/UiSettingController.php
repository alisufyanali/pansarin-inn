<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\HomepageCategoryProduct;
use App\Models\Product;
use App\Models\UiSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UiSettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.settings')->only(['index']);
        $this->middleware('permission:edit.settings')->only([
            'updateBrandingUI', 'updateHeaderUI', 'updateHomepageUI',
            'updateCategoriesUI', 'updateProductsUI', 'updateEmailUI',
            'updateMarketingUI', 'updateCategoryProducts',
        ]);
    }

    private function updateSettings(Request $request, $keys) {
        foreach ($keys as $key) {
            if ($request->has($key)) {
                $value = $request->$key;

                if ($request->hasFile($key)) {
                    $oldSetting = UiSetting::where('type', $key)->first();
                    if ($oldSetting && $oldSetting->value) {
                        $oldPath = str_replace('/storage/', '', $oldSetting->value);
                        Storage::disk('public')->delete($oldPath);
                    }

                    $path = $request->file($key)->store('uploads/ui', 'public');
                    $value = Storage::url($path);
                }

                if ($value !== null) {
                    UiSetting::updateOrCreate(
                        ['type' => $key],
                        ['value' => $value]
                    );
                }
            }
        }
    }

    public function index() {
        // Build categoryProducts map: { category_id => [product_id, ...] ordered by sort_order }
        $categoryProducts = HomepageCategoryProduct::orderBy('sort_order')
            ->get()
            ->groupBy('category_id')
            ->map(fn ($rows) => $rows->pluck('product_id')->values())
            ->toArray();

        $categories = Category::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($c) => [
                'id'   => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                // products in this category available for selection
                'products' => Product::where('category_id', $c->id)
                    ->where('status', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'sku', 'thumbnail'])
                    ->map(fn ($p) => [
                        'id'        => $p->id,
                        'name'      => $p->name,
                        'sku'       => $p->sku,
                        'thumbnail' => $p->thumbnail ? asset('storage/' . $p->thumbnail) : null,
                    ]),
            ])
            ->filter(fn ($c) => count($c['products']) > 0)
            ->values();

        return Inertia::render('Admin/Settings/ui/index', [
            'settings'         => UiSetting::pluck('value', 'type')->all(),
            'categories'       => $categories,
            'categoryProducts' => $categoryProducts,
        ]);
    }

    public function updateBrandingUI(Request $request) {
        $request->validate([
            'home_top_logo' => 'nullable|image|max:2048',
            'fav_ext' => 'nullable|image|max:1024',
        ]);

        $this->updateSettings($request, [
            'header_color',
            'footer_color',
            'font',
            'home_top_logo',
            'fav_ext',
        ]);

        return redirect()->route('admin.ui-settings.index')->with('success', 'Brand Settings updated!');
    }

    public function updateHeaderUI(Request $request){
        $this->updateSettings($request, [
            'header_homepage_status',
            'header_all_categories_status',
            'header_featured_products_status',
            'header_todays_deal_status',
            'header_blogs_status',
            'header_contact_status',
            'header_store_locator_status',
        ]);

        return redirect()->route('admin.ui-settings.index')->with('success', 'Header updated!');
    }

    public function updateHomepageUI(Request $request){
        $this->updateSettings($request, [
            'featured_show',
            'brand_show',
            'blog_show',
            'vandors_show',
            'marquee_text',
            'parallax_blog_title',
            'parallax_vendor_title',
        ]);

        \Illuminate\Support\Facades\Cache::forget('homepage_data');

        return redirect()->route('admin.ui-settings.index')->with('success', 'Homepage updated!');
    }

    public function updateCategoriesUI(Request $request){
        $this->updateSettings($request, [
            'category_slides',
            'side_bar_pos_category',
            'category_product_box_style',
            'home_categories',
            'top_slide_categories',
        ]);

        \Illuminate\Support\Facades\Cache::forget('homepage_data');

        return redirect()->route('admin.ui-settings.index')->with('success', 'Categories updated!');
    }

    public function updateProductsUI(Request $request){
        $this->updateSettings($request, [
            'no_of_featured_products',
            'no_of_deal_products',
            'featured_product_box_style',
            'special_products_show',
        ]);

        return redirect()->route('admin.ui-settings.index')->with('success', 'Products Setting updated!');
    }

    public function updateEmailUI(Request $request){
        $this->updateSettings($request, [
            'email_theme_style',
            'email_theme_style_2',
        ]);

        return redirect()->route('admin.ui-settings.index')->with('success', 'Email Template updated!');
    }

    public function updateMarketingUI(Request $request){
        $this->updateSettings($request, [
            'whatsapp_number',
            'whatsapp_message',
            'affiliate_system',
        ]);

        return redirect()->route('admin.ui-settings.index')->with('success', 'Marketing updated!');
    }

    public function updateCategoryProducts(Request $request)
    {
        $request->validate([
            'category_id'    => 'required|integer|exists:categories,id',
            'products'       => 'present|array',
            'products.*'     => 'integer|exists:products,id',
        ]);

        $categoryId = (int) $request->category_id;
        $productIds = $request->products ?? [];

        // Verify each product belongs to this category
        if (!empty($productIds)) {
            $validCount = Product::where('category_id', $categoryId)
                ->whereIn('id', $productIds)
                ->count();

            if ($validCount !== count($productIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more products do not belong to the selected category.',
                ], 422);
            }
        }

        // Clear existing selections for this category, then insert new ones
        HomepageCategoryProduct::where('category_id', $categoryId)->delete();

        foreach ($productIds as $index => $productId) {
            HomepageCategoryProduct::create([
                'category_id' => $categoryId,
                'product_id'  => $productId,
                'sort_order'  => $index,
            ]);
        }

        \Illuminate\Support\Facades\Cache::forget('homepage_data');

        return response()->json([
            'success' => true,
            'message' => 'Category products updated!',
        ]);
    }
}
