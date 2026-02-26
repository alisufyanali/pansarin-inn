<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessSetting;
use App\Models\GeneralSetting;
use App\Models\UiSetting;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function index()
    {

        $general = GeneralSetting::all()->keyBy('type');
        $business = BusinessSetting::all()->keyBy('type');
        $ui = UiSetting::all()->keyBy('type');

        return Inertia::render('Frontend', [
            'siteData' => [
                // General Settings: System Name, Title
                'general' => [
                    'name'  => $general['system_name']->value ?? 'Pansari Inn',
                    'title' => $general['system_title']->value ?? 'Welcome',
                    'contact_address' => $general['contact_address']->value ?? 'test',
                    'contact_phone' => $general['contact_phone']->value ?? 'test',
                    'contact_email' => $general['contact_email']->value ?? 'test',
                    'facebook_url' => $general['facebook_url']->value ?? 'test',
                    'instagram_url' => $general['instagram_url']->value ?? 'test',
                    'footer_text' => $general['footer_text']->value ?? 'test',
                ],
                
                // Business Settings: Currency, Payment Status
                'business' => [
                    'currency' => $business['currency_symbol']->value ?? '$',
                    'paypal_enabled' => ($business['paypal_set']->status ?? 'no') === 'ok',
                ],

                // UI Settings: Logo, Colors
                'ui' => [
                    'header_color' => $ui['header_color']->value ??  '#4f46e5',
                    'footer_color' => $ui['footer_color']->value ?? '#4f46e5',
                    'font'         => $ui['font']->value ?? 'Inter',
                    'logo'         => $ui['home_top_logo']->value ?? null,
                    'favicon'      => $ui['fav_ext']->value ?? null,
                ]
            ]
        ]);
    }
}