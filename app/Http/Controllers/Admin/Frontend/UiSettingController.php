<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\UiSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UiSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Frontend/settings/ui/index', [
            'settings' => UiSetting::pluck('value', 'type')->all()
        ]);
    }

    public function store(Request $request)
    {
        dd($request->all());
        $section = $request->input('section'); // Frontend se 'section' bhejenge

        return match($section) {
            'branding'  => $this->updateBranding($request),
            'header'    => $this->updateHeader($request),
            'homepage'  => $this->updateHomepage($request),
            'email'     => $this->updateEmail($request),
            'marketing' => $this->updateMarketing($request),
            default     => $this->updateGeneral($request),
        };
    }

    protected function updateBranding(Request $request) 
    {
        // Simple fields save karein
        $this->saveSettings($request->only(['header_color', 'footer_color', 'font']));

        // Logo upload logic
        if ($request->hasFile('home_top_logo')) {
            $setting = UiSetting::firstOrCreate(['type' => 'home_top_logo']);
            $setting->clearMediaCollection('logo');
            $media = $setting->addMediaFromRequest('home_top_logo')->toMediaCollection('logo');
            $setting->update(['value' => $media->id]); // Media ID save kar rahe hain
        }

        // Favicon upload logic
        if ($request->hasFile('fav_ext')) {
            $setting = UiSetting::firstOrCreate(['type' => 'fav_ext']);
            $setting->clearMediaCollection('favicon');
            $media = $setting->addMediaFromRequest('fav_ext')->toMediaCollection('favicon');
            $setting->update(['value' => $media->id]);
        }

        return back();
    }

    protected function updateEmail(Request $request) 
    {
        // Yahan HTML validation kar sakte hain
        $this->saveSettings($request->only(['email_theme_style', 'email_theme_style_2']));
        return back()->with('success', 'Email Templates Saved!');
    }

    // Common Helper Function
    private function saveSettings($data) 
    {
        foreach ($data as $type => $value) {
            UiSetting::updateOrCreate(['type' => $type], ['value' => $value]);
        }
    }
}