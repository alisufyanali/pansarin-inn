<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Affiliate;
use App\Models\Referral;
use App\Models\Customer;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct() {
        // Permissions check
        $this->middleware('permission:view.users')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.users')->only(['create', 'store']);
        $this->middleware('permission:edit.users')->only(['edit', 'update']);
        $this->middleware('permission:delete.users')->only(['destroy']);
    }

    // List users with stats
    public function index() {
        $totalUsers = User::count();

        $admins = Role::where('name', 'admin')->exists() ? User::role('admin')->count() : 0;
        $affiliate = Role::where('name', 'affiliate')->exists() ? User::role('affiliate')->count() : 0;
        $customers = Role::where('name', 'customer')->exists() ? User::role('customer')->count() : 0;

        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->get(),
            'stats' => [
                'total' => $totalUsers,
                'admins' => $admins,
                'affiliate' => $affiliate,
                'customers' => $customers,
            ],
        ]);
    }

    // API: Data for table (search/sort/paginate)
    public function getData(Request $request) {
        $query = User::with('roles')->latest();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('roles', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'id');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
        ]);
    }

    public function create() {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'referred_by' => 'nullable|exists:users,id',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. User Create
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'password' => Hash::make($request->password),
                    'username' => $request->username ?? Str::slug($request->name) . '-' . rand(10, 99),
                    'status' => $request->status ?? 1,
                    'referred_by' => $request->referred_by,
                ]);

                $user->syncRoles($request->roles);
                $selectedRoles = array_map('strtolower', $request->roles);

                // 2. Customer & Financials (Wallet/Points)
                if (in_array('customer', $selectedRoles) || in_array('affiliate', $selectedRoles)) {
                    $customer = Customer::create([
                        'user_id'    => $user->id,
                        'first_name' => $user->name,
                        'email'      => $user->email,
                        'phone'      => $user->phone ?? '0000000000',
                    ]);

                    $customer->wallet()->create(['balance' => 0]);
                    $customer->loyaltyPoints()->create(['balance' => 0]);
                }

                // 3. Affiliate Entry
                if (in_array('affiliate', $selectedRoles)) {
                    Affiliate::create([
                        'user_id'         => $user->id,
                        'affiliate_code'  => strtoupper(Str::random(10)),
                        'status'          => 'active',
                        'commission_rate' => 5.00,
                        'joined_at'       => now(),
                    ]);
                }

                // 4. Referral Tracking
                if ($user->referred_by) {
                    $referrerAffiliate = Affiliate::where('user_id', $user->referred_by)->first();

                    if ($referrerAffiliate) {
                        Referral::create([
                            'affiliate_id'             => $referrerAffiliate->id,
                            'customer_id'              => $user->id,
                            'order_amount'             => 0,
                            'commission_rate_snapshot' => $referrerAffiliate->commission_rate,
                            'commission_amount'        => 0,
                            'status'                   => 'pending',
                            'level'                    => 1,
                            'referral_type'            => 'direct',
                        ]);
                    }
                }

                return redirect()->route('admin.users.index')->with('success', 'User registered successfully!');
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }

    public function show(string $id) {
        $user = User::with([
            'roles',
            'customer.wallet.transactions' => function($query) {
                $query->latest()->limit(10); // last 10 transactions
            },
            'customer.loyaltyPoints.transactions' => function($query) {
                $query->latest()->limit(10);
            },
            'customer.referredBy.affiliate.user'
        ])->findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(string $id) {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
            'userRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    public function update(Request $request, User $user) {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone'    => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'roles'    => 'required|array',
        ]);

        $user->update($request->only('name', 'username', 'email', 'phone'));

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->syncRoles($request->roles);
        $selectedRoles = array_map('strtolower', $request->roles);

        // Customer & Wallet Logic (Check on Update)
        if (in_array('customer', $selectedRoles) || in_array('affiliate', $selectedRoles)) {
        
            $customer = Customer::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone ?? '0000000000',
                ]
            );

            // Wallet check
            if (!$customer->wallet) {
                $customer->wallet()->create(['balance' => 0]);
            }

            // Loyalty Points check
            if (!$customer->loyaltyPoints) {
                $customer->loyaltyPoints()->create(['balance' => 0]);
            }
        }

        // Affiliate Logic
        if (in_array('affiliate', $selectedRoles)) {
            Affiliate::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'affiliate_code'  => strtoupper(Str::random(10)),
                    'status'          => 'active',
                    'commission_rate' => 5.00,
                    'joined_at'       => now(),
                ]
            );
        } else {
            Affiliate::where('user_id', $user->id)->delete();
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated!');
    }

    public function destroy(string $id) {
        $user = User::findOrFail($id);
        $user->delete();

        return to_route('admin.users.index')->with('success', 'User successfully deleted!');
    }
}
