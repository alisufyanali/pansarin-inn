<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\UiSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UiSettingController extends Controller
{

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
        return Inertia::render('Admin/Settings/ui/index', [
            'settings' => UiSetting::pluck('value', 'type')->all()
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

        return redirect()->back()->with('success', 'Brand Settings updated!');
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

        return redirect()->back()->with('success', 'Header updated!');
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

        return redirect()->back()->with('success', 'Homepage updated!');
    }

    public function updateCategoriesUI(Request $request){

        $this->updateSettings($request, [
            'category_slides',
            'side_bar_pos_category',
            'category_product_box_style',
            'home_categories',
            'top_slide_categories',
        ]);

        return redirect()->back()->with('success', 'Categories updated!');
    }

    public function updateProductsUI(Request $request){

        $this->updateSettings($request, [
            'no_of_featured_products',
            'no_of_deal_products',
            'featured_product_box_style',
            'special_products_show',
        ]);

        return redirect()->back()->with('success', 'Products Setting updated!');
    }

    public function updateEmailUI(Request $request){

        $this->updateSettings($request, [
            'email_theme_style',
            'email_theme_style_2',
        ]);

        return redirect()->back()->with('success', 'Email Template updated!');
    }

    public function updateMarketingUI(Request $request){

        $this->updateSettings($request, [
            'whatsapp_number',
            'whatsapp_message',
            'affiliate_system',
        ]);

        return redirect()->back()->with('success', 'Marketing updated!');
    }
}