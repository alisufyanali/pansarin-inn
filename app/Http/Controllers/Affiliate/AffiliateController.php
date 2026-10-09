<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Affiliate;
use app\Models\AffiliateCommission;
use App\Models\Referral;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AffiliateController extends Controller
{
    public function joinAffiliate(Request $request) {
        $user = Auth::user();

        if ($user->hasRole('affiliate')) {
            return redirect()->route('affiliate.dashboard')->with('message', 'You are already an affiliate.');
        }

        // Applications wait for admin approval; the affiliate role is given on approval
        Affiliate::firstOrCreate(
            ['user_id' => $user->id],
            [
                'affiliate_code' => Affiliate::generateCode(),
                'status'         => 'pending',
            ]
        );

        return redirect()->route('home')->with('success', 'Application received! You will get access once an admin approves it.');
    }

    /** Catalogue products with their "from" price, for sharing links. */
    private function shareableProducts(Affiliate $affiliate, ?int $limit = null)
    {
        $perOrder = $affiliate->commissionPerOrder();

        return Product::where('status', true)
            ->with(['variants' => fn ($q) => $q->where('status', true)])
            ->orderBy('name')
            ->when($limit, fn ($q) => $q->limit($limit))
            ->get(['id', 'name', 'slug'])
            ->map(fn ($product) => [
                'id'                => $product->id,
                'name'              => $product->name,
                'slug'              => $product->slug,
                'sale_price'        => (float) ($product->variants->min(fn ($v) => ($v->sale_price ?? $v->price) + ($v->additional ?? 0)) ?? 0),
                'commission_amount' => $perOrder,
            ]);
    }

    public function dashboard() {
        $user = auth()->user();
        $affiliate = $user->affiliate;

        if (!$affiliate) {
            return redirect()->route('home')->with('error', 'Affiliate record not found.');
        }

        // 1. Products to share (commission is a fixed amount per delivered order)
        $products = $this->shareableProducts($affiliate, 10);

        // 2. REAL STATS: balance from the affiliate table, totals from the commissions table
        $totalEarnings = \App\Models\AffiliateCommission::where('affiliate_id', $affiliate->id)
            ->where('status', 'earned')
            ->sum('commission_amount');

        // 3. Referred Users (Downline) logic
        $referrals = User::where('referred_by', $user->id)
            ->latest()
            ->get()
            ->map(function($refUser) use ($affiliate) {

                $userCommission = \App\Models\AffiliateCommission::where('affiliate_id', $affiliate->id)
                    ->whereHas('order', function($q) use ($refUser) {
                        $q->where('customer_id', function($sub) use ($refUser) {
                            $sub->select('id')->from('customers')->where('user_id', $refUser->id);
                        });
                    })
                    ->sum('commission_amount');

                return [
                    'id' => $refUser->id,
                    'name' => $refUser->name,
                    // Referred customers' contact details are not shared with the affiliate
                    'email' => $refUser->email ? \Illuminate\Support\Str::mask($refUser->email, '*', 2, max(0, strpos($refUser->email, '@') - 2)) : '',
                    'created_at' => $refUser->created_at->format('d M Y'),
                    'total_purchases' => \App\Models\Order::whereIn('customer_id', function ($sub) use ($refUser) {
                        $sub->select('id')->from('customers')->where('user_id', $refUser->id);
                    })->where('status', '!=', 'cancelled')->count(),
                    'total_commission' => number_format($userCommission, 2),
                ];
            });

            // Order History (Commission Break-up)
            $commissionHistory = \App\Models\AffiliateCommission::where('affiliate_id', $affiliate->id)
            ->with(['order:id,order_number,grand_total,status,created_at'])
            ->latest()
            ->get()
            ->map(function($comm) {
                return [
                    'order_number' => $comm->order->order_number ?? 'N/A',
                    'order_amount' => number_format($comm->order_subtotal, 2),
                    'commission_amount' => number_format($comm->commission_amount, 2),
                    'percentage' => $comm->commission_percentage . '%',
                    'date' => $comm->created_at->format('d M Y'),
                    'status' => $comm->status
                ];
            });

        return Inertia::render('Affiliate/Dashboard', [
            'products' => $products,
            'affiliateCode' => $affiliate->affiliate_code,
            // Referral links point at the storefront, which keeps ?ref= and sends it with signup/orders
            'storefrontUrl' => rtrim((string) config('app.frontend_url'), '/'),
            'referrals' => $referrals,
            'commissionHistory' => $commissionHistory,
            'stats' => [
                'total_referrals' => $referrals->count(),
                'total_earnings' => number_format($affiliate->balance, 2),
                'commission_per_order' => $affiliate->commissionPerOrder(),
            ]
        ]);
    }

    public function showRegisterForm(Request $request) {
        $refCode = $request->query('ref');
        $productSlug = $request->query('product');

        // 1. If the URL has a ref, set / update the cookie
        if ($refCode) {
            cookie()->queue('affiliate_ref', $refCode, 60 * 24 * 30);
        } else {
            // 2. Otherwise take the code from the existing cookie
            $refCode = $request->cookie('affiliate_ref');
        }

        // 3. Product redirection logic
        if ($productSlug) {
            $product = \App\Models\Product::where('slug', $productSlug)->first();
            if ($product) {
                return redirect()->to("/frontend/products/{$product->slug}");
            }
        }

        // 4. Pass affiliate_code to Inertia (from the URL or the cookie)
        return Inertia::render('Affiliate/Registration', [
            'affiliate_code' => $refCode ?? '' 
        ]);
    }

    public function registerCustomer(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'affiliate_code' => 'nullable|string|exists:affiliates,affiliate_code',
            'phone' => ['required', 'string', 'max:30', function ($attr, $value, $fail) {
                $normalized = \App\Helpers\PhoneHelper::normalize($value);
                if (! $normalized) {
                    $fail('Invalid Pakistani mobile number. Use format 03XXXXXXXXX.');
                } elseif (User::where('username', $normalized)->orWhere('phone', $normalized)->exists()
                    || \App\Models\Customer::where('phone', $normalized)->whereNotNull('user_id')->exists()) {
                    $fail('An account with this phone number already exists. Please log in instead.');
                }
            }],
        ]);

        $phone = \App\Helpers\PhoneHelper::normalize($request->phone);

        $referredById = null;

        // 1. Check if code is in Form (Manual entry)
        if ($request->filled('affiliate_code')) {
            $affiliate = Affiliate::where('affiliate_code', $request->affiliate_code)->first();
            if ($affiliate) $referredById = $affiliate->user_id;
        } 
        // 2. If no manual code, check Cookie
        else if ($refCode = $request->cookie('affiliate_ref')) {
            $referrer = Affiliate::where('affiliate_code', $refCode)->first();
            if ($referrer) $referredById = $referrer->user_id;
        }

        // Same shape as every other customer account: username = normalized phone
        // (the storefront logs in by phone) and a Customer profile with wallet and
        // loyalty points, without which the customer cannot place orders.
        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $phone, $referredById) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $phone,
                'username' => $phone,
                'password' => Hash::make($request->password),
                'referred_by' => $referredById,
            ]);

            $user->assignRole('customer');

            $parts = preg_split('/\s+/', trim($request->name), 2);
            $customer = \App\Models\Customer::where('phone', $phone)->whereNull('user_id')->first();
            if ($customer) {
                $customer->update(['user_id' => $user->id]);
            } else {
                $customer = \App\Models\Customer::create([
                    'user_id'    => $user->id,
                    'first_name' => $parts[0],
                    'last_name'  => $parts[1] ?? null,
                    'phone'      => $phone,
                    'email'      => $request->email,
                    'status'     => 'active',
                ]);
            }
            if (! $customer->wallet) {
                $customer->wallet()->create(['balance' => 0]);
            }
            if (! $customer->loyaltyPoints) {
                $customer->loyaltyPoints()->create(['balance' => 0]);
            }
        });
        return redirect()->route('login')->with('success', 'Registration successful!');
    }

    public function showReferralDetails($id) {
        $user = auth()->user();
        $affiliate = $user->affiliate;

        // 1. Make sure the customer was referred by this affiliate
        $customerUser = User::where('id', $id)
            ->where('referred_by', $user->id)
            ->firstOrFail();

        // 2. Load all of this customer's commission records (orders)
        // Uses the AffiliateCommission table that the commission service fills
        $commissions = \App\Models\AffiliateCommission::where('affiliate_id', $affiliate->id)
            ->whereHas('order', function($q) use ($id) {
                // Match the customer's user_id through the order
                $q->whereHas('customer', function($sub) use ($id) {
                    $sub->where('user_id', $id);
                });
            })
            ->with('order')
            ->latest()
            ->get();

        return Inertia::render('Affiliate/ReferralDetails', [
            'customer' => [
                'name' => $customerUser->name,
                'email' => $customerUser->email,
                'joined' => $customerUser->created_at->format('d M Y'),
            ],
            'orders' => $commissions->map(function($item) {
                return [
                    'id' => $item->id,
                    'order_number' => $item->order->order_number ?? 'N/A',
                    'amount' => number_format($item->order_subtotal, 2),
                    'commission' => number_format($item->commission_amount, 2),
                    'status' => ($item->status === 'earned') ? 'paid' : 'pending',
                    'date' => $item->created_at->format('d M Y'),
                ];
            }),
            'stats' => [
                'total_spent' => number_format($commissions->sum('order_subtotal'), 2),
                'total_earned' => number_format($commissions->sum('commission_amount'), 2),
            ]
        ]);
    }

    public function productCatalog() {
        $user = auth()->user();
        $affiliate = $user->affiliate;

        // Security: stop if there is no affiliate record
        if (!$affiliate) {
            return redirect()->route('home');
        }

        return Inertia::render('Affiliate/ProductCatalog', [
            'products' => $this->shareableProducts($affiliate),
            'affiliateCode' => $affiliate->affiliate_code,
            'storefrontUrl' => rtrim((string) config('app.frontend_url'), '/'),
            'commissionPerOrder' => $affiliate->commissionPerOrder(),
        ]);
    }
}