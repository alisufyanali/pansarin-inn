<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessSettingController extends Controller
{

    private function save($key, $value = null, $status = null)
    {
        BusinessSetting::updateOrCreate(
            ['type' => $key],
            [
                'value' => $value,
                'status' => $status
            ]
        );
    }

    public function index()
    {
        $settings = BusinessSetting::all()->keyBy('type');

        return Inertia::render('Admin/Frontend/settings/business/index', [
            'settings' => $settings
        ]);
    }

    // A. Payments (PayPal, Stripe, COD)
    public function updatePayments(Request $request) {
        // PayPal
        $this->save('paypal_set', null, $request->paypal_set); // 'ok' or null
        $this->save('paypal_email', $request->paypal_email);
        $this->save('paypal_type', $request->paypal_type); // sandbox or live

        // Stripe
        $this->save('stripe_set', null, $request->stripe_set);
        $this->save('stripe_publishable', $request->stripe_publishable);
        $this->save('stripe_secret', $request->stripe_secret);

        // Cash on Delivery
        $this->save('cash_on_delivery', null, $request->cash_set);

        return back()->with('success', 'Payment gateways updated!');
    }

    // B. Currency & Pricing
    public function updateCurrency(Request $request) {
        $this->save('currency_code', $request->currency_code, 'ok');
        $this->save('currency_symbol', $request->currency_symbol, 'ok');
        $this->save('currency_format', $request->currency_format, 'ok');
        $this->save('no_of_decimals', $request->no_of_decimals, 'ok');
        
        return back()->with('success', 'Currency settings updated!');
    }

    // C. Shipping & Order Rules
    public function updateShipping(Request $request) {
        $this->save('shipping_cost', $request->shipping_cost, $request->shipping_set);
        $this->save('shipping_cost_type', $request->shipping_cost_type, 'ok'); // flat or product_wise
        $this->save('shipment_info', $request->shipment_info, 'ok');
        
        return back()->with('success', 'Shipping rules updated!');
    }

    // D. Vendor & Commission System
    public function updateVendor(Request $request) {
        $this->save('commission_set', null, $request->commission_set);
        $this->save('commission_amount', $request->commission_amount, 'ok');
        $this->save('vendor_vp_set', null, $request->vendor_vp_set);
        
        return back()->with('success', 'Vendor settings updated!');
    }

    // E. FAQs / Content
    public function updateFaqs(Request $request) {
        $this->save('faqs', $request->faqs, 'ok');
        return back()->with('success', 'FAQs updated successfully!');
    }

    // F. External Gateways (SSLCommerz, etc)
    public function updateGateways(Request $request) {
        $this->save('ssl_set', null, $request->ssl_set);
        $this->save('ssl_store_id', $request->ssl_store_id);
        $this->save('ssl_store_passwd', $request->ssl_store_passwd);
        
        return back()->with('success', 'External gateways updated!');
    }

    // G. Advanced / Business Logic
    public function updateAdvanced(Request $request) {
        $this->save('order_cancellation', null, $request->order_cancellation_set);
        $this->save('coupon_system', null, $request->coupon_system_set);
        
        return back()->with('success', 'Advanced business settings updated!');
    }
}