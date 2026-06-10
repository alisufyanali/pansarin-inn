<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    public function index() {
    return Inertia::render('Test/SeederDashboard'); 
    }

    public function runTestSeeder() {
        Artisan::call('db:seed', ['--class' => 'TestRunMessageSeeder']);
        return back()->with('success', 'Seeder Chala Diya Gaya Hai!');
    }

    // / 1. Order Place karne ka method
    public function placeTestOrder()
    {
        try {
            Artisan::call('db:seed', ['--class' => 'TestRunPlaceOrder']);
            Log::info('TEST: Order successfully placed via Seeder Button.');
            
            return back()->with('success', 'Order Place ho gaya hai! (referral1@example.com)');
        } catch (\Exception $e) {
            Log::error('TEST ERROR (Place Order): ' . $e->getMessage());
            return back()->with('error', 'Order placement failed.');
        }
    }

    // 2. Order Deliver karne ka method
    public function deliverTestOrder()
    {
        try {
            Artisan::call('db:seed', ['--class' => 'TestRunOrderDeliver']);
            Log::info('TEST: Order status updated to DELIVERED via Seeder Button.');
            
            return back()->with('success', 'Order Deliver ho gaya! Commission check karein.');
        } catch (\Exception $e) {
            Log::error('TEST ERROR (Deliver Order): ' . $e->getMessage());
            return back()->with('error', 'Order delivery update failed.');
        }
    }
}