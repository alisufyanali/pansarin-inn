<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessSettingController extends Controller
{

    private function save($key, $value = null, $status = null) {
        $finalValue = is_array($value) ? json_encode($value) : $value;

        BusinessSetting::updateOrCreate(
            ['type' => $key],
            [
                'value' => $finalValue,
                'status' => $status
            ]
        );
    }

    public function index() {
        $settings = BusinessSetting::all()->keyBy('type');

        return Inertia::render('Admin/Settings/business/index', [
            'settings' => $settings
        ]);
    }

    // A. Payments (PayPal, Stripe, COD)
    public function updatePayments(Request $request) {

        $request->validate([
            'paypal_set' => 'required|in:ok,no',
            'paypal_email' => 'nullable|email',
            'paypal_type' => 'nullable|in:sandbox,live',
            'stripe_set' => 'required|in:ok,no',
            'stripe_publishable' => 'nullable|string',
            'stripe_secret' => 'nullable|string',
            'cash_set' => 'required|in:ok,no',
        ]);

        // PayPal
        $this->save('paypal_set', null, $request->paypal_set);
        $this->save('paypal_email', $request->paypal_email);
        $this->save('paypal_type', $request->paypal_type);

        // Stripe
        $this->save('stripe_set', null, $request->stripe_set);
        $this->save('stripe_publishable', $request->stripe_publishable);
        $this->save('stripe_secret', $request->stripe_secret);

        // Cash on Delivery
        $this->save('cash_on_delivery', null, $request->cash_set);

        return redirect()->back()->with('success', 'Payment gateways updated!');
    }

    // B. Currency & Pricing
    public function updateCurrency(Request $request) {
        $this->save('currency_code', $request->currency_code);
        $this->save('currency_symbol', $request->currency_symbol);
        $this->save('currency_format', $request->currency_format);
        $this->save('no_of_decimals', $request->no_of_decimals);
        
        return redirect()->back()->with('success', 'Currency settings updated!');
    }

    // C. Shipping & Order Rules
    public function updateShipping(Request $request) {
        $this->save('shipping_cost', $request->shipping_cost, $request->shipping_set);
        $this->save('shipping_cost_type', $request->shipping_cost_type);
        $this->save('shipment_info', $request->shipment_info);
        
        return redirect()->back()->with('success', 'Shipping rules updated!');
    }

    // D. Vendor & Commission System
    public function updateVendor(Request $request) {
        $this->save('commission_set', null, $request->commission_set);
        $this->save('commission_amount', $request->commission_amount);
        $this->save('vendor_vp_set', null, $request->vendor_vp_set);
        
        return redirect()->back()->with('success', 'Vendor settings updated!');
    }

    // E. FAQs / Content
    public function updateFaqs(Request $request) {
        $request->validate([
            'faqs' => 'required|array|min:1',
            'faqs.*.question' => 'required|string|max:255',
            'faqs.*.answer' => 'required|string',
        ]);

        $filteredFaqs = collect($request->faqs)
            ->filter(fn($faq) => !empty($faq['question']) && !empty($faq['answer']))
            ->values()
            ->toArray();

        $this->save('faqs', $filteredFaqs); 

        return redirect()->back()->with('success', 'FAQs updated successfully!');
    }


    // F. External Gateways (SSLCommerz, etc)
    public function updateGateways(Request $request) {
        $this->save('ssl_set', null, $request->ssl_set);
        $this->save('ssl_store_id', $request->ssl_store_id);
        $this->save('ssl_store_passwd', $request->ssl_store_passwd);
        $this->save('ssl_type', $request->ssl_type);
        $this->save('business_debug', $request->business_debug);
        
        return redirect()->back()->with('success', 'External gateways updated!');
    }

    // G. Advanced / Business Logic
    public function updateAdvanced(Request $request) {
        $this->save('order_cancellation', null, $request->order_cancellation_set);
        $this->save('coupon_system', null, $request->coupon_system_set);
        
        return redirect()->back()->with('success', 'Advanced business settings updated!');
    }
}