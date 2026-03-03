<?php

namespace App\Http\Repositories\Admin;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class CustomerRepository
{
    public function getAllForDataTable(Request $request)
    {
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

    public function find($id)
    {
        return Customer::with([
        'user', 
        'wallet', 
        'loyaltyPoints', 
        'city', 
        'customerGroup'
    ])->findOrFail($id);
    }

    public function getStats()
    {
        return [
            'total' => Customer::count(),
            'active_customers' => Customer::where('status', 'active')->count(),
            'total_wallet_balance' => \App\Models\Wallet::where('walletable_type', 'App\Models\Customer')->sum('balance'),
            'cities' => Customer::distinct('city_id')->whereNotNull('city_id')->count(),
        ];
    }
}