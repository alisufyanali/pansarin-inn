<?php

namespace App\Http\Controllers\Affiliate;

// use App\Http\Controllers\Controller;
// use App\Models\Affiliate;
// use App\Models\Referral;
// use Illuminate\Http\Request;
// use Illuminate\Support\Str;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Cookie;
// use Illuminate\Support\Facades\DB;

// class AffiliateController extends Controller
// {
//     // public function index() {
//     //     // User aur uski affiliate relationship ko load karen
//     //     $user = auth()->user();
//     //     $affiliate = $user->affiliate;
        
//     //     // Agar affiliate nahi hai to Registration page dikhayen
//     //     // if (!$affiliate) {
//     //     //     return Inertia::render('Affiliate/Registration');
//     //     // }

//     //     // // Agar status 'pending' ya 'blocked' hai to dashboard ke bajaye koi notice dikhana behtar hai
//     //     // if ($affiliate->status !== 'active') {
//     //     //     return Inertia::render('Affiliate/StatusNotice', [
//     //     //         'status' => $affiliate->status
//     //     //     ]);
//     //     // }

//     //     return Inertia::render('Affiliate/Dashboard', [
//     //         'stats' => [
//     //             'balance' => (float) $affiliate->balance,
//     //             'total_referrals' => $affiliate->referrals()->count(),
//     //             'pending_commissions' => (float) $affiliate->referrals()->where('status', 'pending')->sum('commission_amount'),
//     //             'affiliate_code' => $affiliate->affiliate_code,
//     //         ]
//     //     ]);
//     // }

//     // public function store(Request $request) {
//     //     $user = auth()->user();

//     //     // 1. Check if already an affiliate
//     //     if ($user->affiliate) {
//     //         return redirect()->back()->with('error', 'You are already an affiliate.');
//     //     }

//     //     // 2. Logic for Multi-level (Parent ID)
//     //     $parentAffiliateId = null;
//     //     $cookieCode = Cookie::get('affiliate_referral');
//     //     if ($cookieCode) {
//     //         $parent = Affiliate::where('affiliate_code', $cookieCode)->first();
//     //         // User apna hi parent nahi ban sakta
//     //         if ($parent && $parent->user_id !== $user->id) {
//     //             $parentAffiliateId = $parent->id;
//     //         }
//     //     }

//     //     DB::transaction(function () use ($user, $parentAffiliateId) {
//     //         // 3. Create Affiliate Record
//     //         Affiliate::create([
//     //             'user_id' => $user->id,
//     //             'affiliate_code' => Str::upper(Str::random(8)),
//     //             'commission_rate' => 5.00,
//     //             'status' => 'active', // '1' ki jagah 'active' kyunke migration mein enum hai
//     //             'parent_id' => $parentAffiliateId,
//     //             'balance' => 0.00,
//     //             'joined_at' => now(),
//     //         ]);

//     //         // 4. Correct Spatie Role Assignment
//     //         // $user->update(['role' => 'affiliate']) kaam nahi karega Spatie ke liye
//     //         if (!$user->hasRole('affiliate')) {
//     //             $user->assignRole('affiliate');
//     //         }
//     //     });

//     //     return redirect()->route('affiliate.index')->with('success', 'Affiliate account created successfully!');
//     // }

//     // public function referrals() {
//     //     $affiliate = auth()->user()->affiliate;

//     //     if (!$affiliate) {
//     //         return redirect()->route('affiliate.index')
//     //             ->with('error', 'Please register as an affiliate first.');
//     //     }

//     //     // Order details ke sath referrals fetch karen
//     //     $referrals = $affiliate->referrals()
//     //         ->with(['order:id,grand_total,status,created_at']) // Order table ke specific columns
//     //         ->latest()
//     //         ->get();
        
//     //     return Inertia::render('Affiliate/Referrals', [
//     //         'referrals' => $referrals
//     //     ]);
//     // }
// }


use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Affiliate;
use app\Models\AffiliateCommission;
use App\Models\Referral;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AffiliateController extends Controller
{
    public function joinAffiliate(Request $request) {
        $user = Auth::user();

        if ($user->hasRole('affiliate')) {
            return redirect()->route('affiliate.dashboard')->with('message', 'Aap pehle se affiliate hain.');
        }

        $user->assignRole('affiliate');

        Affiliate::firstOrCreate(
            ['user_id' => $user->id],
            [
                'affiliate_code'  => strtoupper(Str::random(10)),
                'status'          => 'active',
                'commission_rate' => 5.00,
                'joined_at'       => now(),
            ]
        );

        // Back ki bajaye dashboard par bhejen taake join hote hi result dikhe
        return redirect()->route('affiliate.dashboard')->with('success', 'Affiliate program joined successfully!');
    }

    // public function dashboard() {
    //     $user = auth()->user();
    //     $affiliate = $user->affiliate;
    //     // Controller mein ab ye kaam karega:

    //     if (!$affiliate) {
    //         return redirect()->route('home')->with('error', 'Affiliate record not found.');
    //     }

    //     // 1. Products with dynamic commission calculation
    //     $products = Product::where('status', 1)->get(['id', 'name', 'slug', 'sale_price'])
    //     ->map(function($product) use ($affiliate) {
    //         // Dashboard.tsx 'commission_amount' expect kar raha hai
    //         $product->commission_amount = ($product->sale_price * ($affiliate->commission_rate ?? 5)) / 100;
    //         return $product;
    //     });

    //     // 2. Stats calculate karen aapke table se
    //     $totalEarnings = \App\Models\Referral::where('affiliate_id', $affiliate->id)
    //         ->whereIn('status', ['approved', 'paid'])
    //         ->sum('commission_amount');

    //     // 3. Referred Users (Downline) with their specific commission total
    //     $referrals = User::where('referred_by', $user->id)
    //         ->latest()
    //         ->get()
    //         ->map(function($refUser) use ($affiliate) {
    //             // Is specific user ne is affiliate ko kitna paisa kama kar diya?
    //             $userCommission = \App\Models\Referral::where('customer_id', $refUser->id)
    //                 ->where('affiliate_id', $affiliate->id)
    //                 ->where('status', '!=', 'cancelled')
    //                 ->sum('commission_amount');

    //             $orderCount = \App\Models\Referral::where('customer_id', $refUser->id)
    //                 ->where('affiliate_id', $affiliate->id)
    //                 ->count();

    //             return [
    //                 'id' => $refUser->id,
    //                 'name' => $refUser->name,
    //                 'email' => $refUser->email,
    //                 'created_at' => $refUser->created_at->format('d M Y'),
    //                 'total_purchases' => $orderCount,
    //                 'total_commission' => number_format($userCommission, 2),
    //             ];
    //         });

    //     return Inertia::render('Affiliate/Dashboard', [
    //         'products' => $products,
    //         'affiliateCode' => $affiliate->affiliate_code,
    //         'referrals' => $referrals,
    //         'stats' => [
    //             'total_referrals' => $referrals->count(),
    //             'total_earnings' => number_format($totalEarnings, 2),
    //             'commission_rate' => $affiliate->commission_rate,
    //         ]
    //     ]);
    // }

    public function dashboard() {
        $user = auth()->user();
        $affiliate = $user->affiliate;

        if (!$affiliate) {
            return redirect()->route('home')->with('error', 'Affiliate record not found.');
        }

        // 1. Products with dynamic commission
        $products = Product::where('status', 1)->limit(10)->get(['id', 'name', 'slug', 'sale_price'])
        ->map(function($product) use ($affiliate) {
            $product->commission_amount = ($product->sale_price * ($affiliate->commission_rate ?? 5)) / 100;
            return $product;
        });

        // 2. REAL STATS: Direct affiliate table se balance aur commissions table se total
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
                    'email' => $refUser->email,
                    'created_at' => $refUser->created_at->format('d M Y'),
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
            'referrals' => $referrals,
            'commissionHistory' => $commissionHistory,
            'stats' => [
                'total_referrals' => $referrals->count(),
                'total_earnings' => number_format($affiliate->balance, 2),
                'commission_rate' => $affiliate->commission_rate,
            ]
        ]);
    }

    public function showRegisterForm(Request $request) {
        $refCode = $request->query('ref');
        $productSlug = $request->query('product');

        // 1. Agar URL mein ref hai to cookie update/set karein
        if ($refCode) {
            cookie()->queue('affiliate_ref', $refCode, 60 * 24 * 30);
        } else {
            // 2. Agar URL mein nahi hai, to purani cookie se code uthayein
            $refCode = $request->cookie('affiliate_ref');
        }

        // 3. Product redirection logic
        if ($productSlug) {
            $product = \App\Models\Product::where('slug', $productSlug)->first();
            if ($product) {
                return redirect()->to("/frontend/products/{$product->slug}");
            }
        }

        // 4. Inertia ko affiliate_code bhejien (chahe URL se ho ya Cookie se)
        return Inertia::render('Affiliate/Registration', [
            'affiliate_code' => $refCode ?? '' 
        ]);
    }

    public function registerCustomer(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'affiliate_code' => 'nullable|string|exists:affiliates,affiliate_code',
        ]);

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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'username' => $request->username ?? Str::slug($request->name) . rand(100, 999),
            'password' => Hash::make($request->password),
            'referred_by' => $referredById,
        ]);

        $user->assignRole('customer');
        return redirect()->route('login')->with('success', 'Registration successful!');
    }

    // public function showReferralDetails($id) {
    //     $user = auth()->user();
        
    //     // Check karein ke ye user waqayi isi affiliate ne refer kiya hai
    //     $customer = User::where('id', $id)
    //         ->where('referred_by', $user->id)
    //         ->firstOrFail();

    //     // Is customer ke saare referral records (orders) uthayein
    //     $orders = \App\Models\Referral::where('customer_id', $id)
    //         ->where('affiliate_id', $user->affiliate->id)
    //         ->with('order') // Agar orders table linked hai
    //         ->latest()
    //         ->get();

    //     return Inertia::render('Affiliate/ReferralDetails', [
    //         'customer' => [
    //             'name' => $customer->name,
    //             'email' => $customer->email,
    //             'joined' => $customer->created_at->format('d M Y'),
    //         ],
    //         'orders' => $orders->map(function($item) {
    //             return [
    //                 'id' => $item->id,
    //                 'amount' => number_format($item->order_amount, 2),
    //                 'commission' => number_format($item->commission_amount, 2),
    //                 'status' => $item->status,
    //                 'date' => $item->created_at->format('d M Y'),
    //                 'type' => $item->referral_type
    //             ];
    //         }),
    //         'stats' => [
    //             'total_spent' => number_format($orders->sum('order_amount'), 2),
    //             'total_earned' => number_format($orders->sum('commission_amount'), 2),
    //         ]
    //     ]);
    // }

    public function showReferralDetails($id) {
        $user = auth()->user();
        $affiliate = $user->affiliate;

        // 1. Customer confirm karein jo is affiliate ne refer kiya ho
        $customerUser = User::where('id', $id)
            ->where('referred_by', $user->id)
            ->firstOrFail();

        // 2. Is customer ke saare commission records (orders) uthayein
        // Hum 'AffiliateCommission' table use karenge jo hamari service ne bhari hai
        $commissions = \App\Models\AffiliateCommission::where('affiliate_id', $affiliate->id)
            ->whereHas('order', function($q) use ($id) {
                // Hum order ke zariye customer ki user_id match kar rahe hain
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

        // Check karein agar affiliate record nahi hai (security)
        if (!$affiliate) {
            return redirect()->route('home');
        }

        // Dashboard wala hi 'status' filter use karein
        $products = Product::where('status', 1)->get()->map(function($product) use ($affiliate) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sale_price' => $product->sale_price,
                // Commission calculation
                'commission_amount' => ($product->sale_price * ($affiliate->commission_rate ?? 5)) / 100,
            ];
        });

        return Inertia::render('Affiliate/ProductCatalog', [
            'products' => $products,
            'affiliateCode' => $affiliate->affiliate_code,
            'commissionRate' => $affiliate->commission_rate ?? 5
        ]);
    }
}