<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneralSettingController extends Controller
{
    private function updateSettings($request, $keys) {
        foreach ($keys as $key) {
            GeneralSetting::updateOrCreate(
                ['type' => $key],
                ['value' => $request->$key]
            );
        }
    }

    public function index() {
        return Inertia::render('Admin/Settings/general/index', [
            'settings' => GeneralSetting::pluck('value', 'type')->all()
        ]);
    }

    public function updateSystem(Request $request) {

        $request->validate([
            'system_name'  => 'required|string|max:100',
            'system_title' => 'required|string|max:150',
        ]);
    
        $this->updateSettings($request, [
            'system_name',
            'system_title',
        ]);
        
        return redirect()->back()->with('success', 'System basics updated successfully!');
    }

    public function updateContact(Request $request) {

        $request->validate([
            'contact_address' => 'string|nullable|max:150',
            'contact_phone' => 'string|nullable|max:16',
            'contact_email' => 'string|nullable|max:100',
            'facebook_url'  => 'string|nullable|max:100',
            'instagram_url' => 'string|nullable|max:100',
            'footer_text'   => 'string|nullable|max:150',
        ]);

        $this->updateSettings($request, [
            'contact_address',
            'contact_phone',
            'contact_email',
            'facebook_url',
            'instagram_url',
            'footer_text',
        ]);

        return redirect()->back()->with('success', 'Contact and footer settings updated!');
    }

    public function updateSeo(Request $request) {

        $this->updateSettings($request, [
            'meta_title',
            'meta_description',
            'meta_keywords',
            'google_analytics_id',
        ]);

        return redirect()->back()->with('success', 'SEO and Meta tags updated!');
    }

    public function updateAuth(Request $request) {

        $request->validate([
            'google_client_id' => 'string|nullable|max:100',
            'facebook_app_id' => 'string|nullable|max:100',

        ]);

        $this->updateSettings($request, [
        'google_login',
        'google_client_id',
        'facebook_login',
        'facebook_app_id',
        ]);

        return redirect()->back()->with('success', 'Social login settings updated!');
    }

    public function updateEcommerce(Request $request) {

        $this->updateSettings($request, [
            'vendor_system',
            'wallet_system',
            'guest_checkout',
            'digital_product',
        ]);

        return redirect()->back()->with('success', 'Ecommerce core settings updated!');
    }

    public function updateEmail(Request $request) {

        $this->updateSettings($request, [
            'mail_driver',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_encryption',
            'mail_from_address',
        ]);

        return redirect()->back()->with('success', 'SMTP / Email configuration updated!');
    }

    public function updateSecurity(Request $request) {

        $this->updateSettings($request, [
            'captcha_status',
            'captcha_key',
            'captcha_secret',
        ]);

        return redirect()->back()->with('success', 'Security and Captcha settings updated!');
    }

    public function updateIntegrations(Request $request) {

        $this->updateSettings($request, [
            'facebook_pixel_id',
            'google_tag_manager_id',
        ]);

        return redirect()->back()->with('success', 'External integrations updated!');
    }

    public function updateLegal(Request $request) {

        $this->updateSettings($request, [
           'terms_and_conditions',
            'privacy_policy',
            'return_policy',
        ]);

        return redirect()->back()->with('success', 'Legal pages content updated!');
    }

    public function updateAdvanced(Request $request) {

        $this->updateSettings($request, [
            'cache_time',
            'debug_mode',
        ]);

        return redirect()->back()->with('success', 'Advanced system settings updated!');
    }
}