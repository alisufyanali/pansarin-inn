<?php

namespace App\Http\Repositories\Admin;

use App\Models\Customer;
use App\Models\User;
use App\Models\Affiliate;
use App\Models\Referral;
use App\Models\Country;
use App\Models\State;
use App\Models\City;
use App\Models\CustomerGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Yajra\DataTables\Facades\DataTables;

class CustomerRepository
{
    public function getAllForDataTable(Request $request) {
        try {
            $query = Customer::with(['user', 'wallet', 'customerGroup', 'city'])->latest();

            if ($request->has('search') && !empty($request->search)) {
                $search = is_array($request->search) ? $request->search['value'] : $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhereHas('user', function($u) use ($search) {
                          $u->where('email', 'like', "%{$search}%");
                      });
                });
            }

            return DataTables::of($query)
            ->addColumn('wallet_balance', function ($customer) {
                return $customer->wallet ? number_format($customer->wallet->balance, 2) : '0.00';
            })
            ->addColumn('email', function ($customer) {
                return $customer->user ? $customer->user->email : $customer->email;
            })
            ->addColumn('group_name', function ($customer) {
                return $customer->customerGroup ? $customer->customerGroup->name : 'General';
            })
            ->filterColumn('wallet_balance', function($query, $keyword) {
                $query->whereHas('wallet', function($q) use ($keyword) {
                    $q->where('balance', 'like', "%{$keyword}%");
                });
            })
            ->filterColumn('group_name', function($query, $keyword) {
                $query->whereHas('customerGroup', function($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%");
                });
            })
            ->rawColumns(['wallet_balance'])
            ->make(true);
        } catch (\Exception $e) {
            Log::error('Customer DataTable error: '.$e->getMessage());
            throw $e;
        }
    }

    public function find($id) {
        return Customer::with([
            'user', 
            'wallet', 
            'loyaltyPoints', 
            'city', 
            'customerGroup'
        ])->findOrFail($id);
    }

    public function getStats() {
        return [
            'total' => Customer::count(),
            'active_customers' => Customer::where('status', 'active')->count(),
            'total_wallet_balance' => \App\Models\Wallet::where('walletable_type', 'App\Models\Customer')->sum('balance'),
            'cities' => Customer::distinct('city_id')->whereNotNull('city_id')->count(),
        ];
    }

    public function store(array $data) {
        return DB::transaction(function () use ($data) {
            $fullName = $data['first_name'] . ' ' . ($data['last_name'] ?? '');

            // 1. Create User Account
            $user = User::create([
                'name'        => $fullName,
                'email'       => $data['email'],
                'phone'       => $data['phone'],
                'username'    => \Str::slug($fullName) . '-' . rand(1000, 9999),
                'password'    => \Hash::make($data['password'] ?? 'password123'),
                'status'      => 1,
                'referred_by' => $data['referred_by'] ?? null,
            ]);

            // 2. Assign Customer Role
            $user->assignRole('customer');

            // 3. Create Customer Profile
            $customer = Customer::create([
                'user_id'           => $user->id,
                'first_name'        => $data['first_name'],
                'last_name'         => $data['last_name'] ?? null,
                'email'             => $data['email'],
                'phone'             => $data['phone'],
                'address'           => $data['address'],
                'city_id'           => $data['city_id'],
                'customer_group_id' => $data['customer_group_id'] ?: null,
                'status'            => $data['status'] ?? 'active',
                'referred_by'       => $data['referred_by'] ?? null,
            ]);

            // 4. Initialize Wallet & Loyalty Points
            $customer->wallet()->create(['balance' => 0]);
            $customer->loyaltyPoints()->create(['balance' => 0]);

            // 5. Referral Tracking Logic
            if ($user->referred_by) {
                $referrerAffiliate = Affiliate::where('user_id', $user->referred_by)->first();

                if ($referrerAffiliate) {
                    Referral::create([
                        'affiliate_id'             => $referrerAffiliate->id,
                        'customer_id'               => $user->id,
                        'order_amount'             => 0,
                        'commission_rate_snapshot' => $referrerAffiliate->commission_rate,
                        'commission_amount'        => 0,
                        'status'                   => 'pending',
                        'level'                    => 1,
                        'referral_type'            => 'direct',
                    ]);
                }
            }

            return $customer;
        });
    }

    // public function update(Customer $customer, array $data) {
    //     return DB::transaction(function () use ($customer, $data) {
    //         $fullName = $data['first_name'] . ' ' . ($data['last_name'] ?? '');

    //         // 1. Update User Account
    //         $customer->user->update([
    //             'name'        => $fullName,
    //             'email'       => $data['email'],
    //             'phone'       => $data['phone'],
    //             'referred_by' => $data['referred_by'] ?? null,
    //         ]);

    //         // 2. Update Customer Profile
    //         $customer->update([
    //             'first_name'        => $data['first_name'],
    //             'last_name'         => $data['last_name'] ?? null,
    //             'email'             => $data['email'],
    //             'phone'             => $data['phone'],
    //             'address'           => $data['address'],
    //             'city_id'           => $data['city_id'],
    //             'customer_group_id' => $data['customer_group_id'] ?: null,
    //             'status'            => $data['status'],
    //             'referred_by'       => $data['referred_by'] ?? null,
    //         ]);

    //         return $customer;
    //     });
    // }

    public function update(Customer $customer, array $data) {
        return DB::transaction(function () use ($customer, $data) {
            $fullName = $data['first_name'] . ' ' . ($data['last_name'] ?? '');

            // Purana referrer ID store karein taake check kar sakein ke change hua hai ya nahi
            $oldReferredBy = $customer->user->referred_by;
            $newReferredBy = $data['referred_by'] ?? null;

            // 1. Update User Account
            $customer->user->update([
                'name'        => $fullName,
                'email'       => $data['email'],
                'phone'       => $data['phone'],
                'referred_by' => $newReferredBy,
            ]);

            // 2. Update Customer Profile
            $customer->update([
                'first_name'        => $data['first_name'],
                'last_name'         => $data['last_name'] ?? null,
                'email'             => $data['email'],
                'phone'             => $data['phone'],
                'address'           => $data['address'],
                'city_id'           => $data['city_id'],
                'customer_group_id' => $data['customer_group_id'] ?: null,
                'status'            => $data['status'],
                'referred_by'       => $newReferredBy,
            ]);

            // 3. Referral Table Sync Logic (The Critical Part)
            if ($oldReferredBy != $newReferredBy) {
                
                // Purana referral entry delete karein (kyunke affiliate badal gaya hai)
                \App\Models\Referral::where('customer_id', $customer->user_id)->delete();

                // Agar naya referrer select kiya gaya hai, to nayi entry banayein
                if ($newReferredBy) {
                    $newAffiliate = \App\Models\Affiliate::where('user_id', $newReferredBy)->first();

                    if ($newAffiliate) {
                        \App\Models\Referral::create([
                            'affiliate_id'             => $newAffiliate->id,
                            'customer_id'              => $customer->user_id, // Yahan 'user_id' hi use karein jaisa store function mein hai
                            'order_amount'             => 0,
                            'commission_rate_snapshot' => $newAffiliate->commission_rate,
                            'commission_amount'        => 0,
                            'status'                   => 'pending',
                            'level'                    => 1,
                            'referral_type'            => 'direct',
                        ]);
                    }
                }
            }

            return $customer;
        });
    }

    public function delete(Customer $customer) {
        return DB::transaction(function () use ($customer) {
            
            // 1. Referral Status Update (Optional but Recommended)
            // Agar customer delete ho gaya hai, to uske pending referrals ko 'cancelled' ya 'void' mark kar dein
            \App\Models\Referral::where('customer_id', $customer->user_id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);

            // 2. Soft Delete User Account
            // Kyunke customer delete ho raha hai, to uska login (User) bhi delete hona chahiye
            if ($customer->user) {
                $customer->user->delete();
            }

            // 3. Soft Delete Customer Profile
            return $customer->delete();
        });
    }
}