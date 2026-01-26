<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneralSettingController extends Controller
{


    private function updateSettings(array $data)
    {
        foreach ($data as $type => $value) {
            if ($value === null || $value === '') continue;

            GeneralSetting::updateOrCreate(
                ['type' => $type],
                ['value' => $value]
            );
        }
    }


    public function index()
    {
        $settings = GeneralSetting::pluck('value', 'type')->all();
        
        return Inertia::render('Admin/Frontend/settings/general/index', [
            'settings' => $settings
        ]);
    }

    public function updateSystem(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'timezone'  => 'required|string',
        ]);

        $this->updateSettings($validated);

        return back()->with('success', 'System basics updated successfully!');
    }


    public function updateContact(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Contact and footer settings updated!');
    }

    public function updateSeo(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'SEO and Meta tags updated!');
    }

    public function updateAuth(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Social login settings updated!');
    }

    public function updateEcommerce(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Ecommerce core settings updated!');
    }

    public function updateEmail(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'SMTP / Email configuration updated!');
    }

    public function updateSecurity(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Security and Captcha settings updated!');
    }

    public function updateIntegrations(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'External integrations updated!');
    }

    public function updateLegal(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Legal pages content updated!');
    }

    public function updateAdvanced(Request $request) {
        $this->updateSettings($request->except('_token', 'section'));
        return back()->with('success', 'Advanced system settings updated!');
    }
}