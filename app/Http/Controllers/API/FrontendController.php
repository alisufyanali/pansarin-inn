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
                ],
                
                // Business Settings: Currency, Payment Status
                'business' => [
                    'currency' => $business['currency_symbol']->value ?? '$',
                    'paypal_enabled' => ($business['paypal_set']->status ?? 'no') === 'ok',
                ],

                // UI Settings: Logo, Colors
                'ui' => [
                    'logo' => $ui['header_logo']->value ?? null,
                    'theme' => $ui['primary_color']->value ?? '#4f46e5',
                ]
            ]
        ]);
    }
}
