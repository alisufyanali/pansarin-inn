<?php

namespace App\Http\Repositories\Admin;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerRepository2
{
    /**
     * Get all customers
     */
    public function getAll()
    {
        return Customer::with(['city'])->latest()->get();
    }

    /**
     * Get DataTable data for customers — paginated JSON for DataTableWrapper
     */
    public function getAllForDataTable(Request $request)
    {
        try {
            $query = Customer::with('city')->latest();

            // Search handling
            if ($request->has('search') && $request->search !== '') {
                $search = is_array($request->search)
                    ? ($request->search['value'] ?? '')
                    : $request->search;

                if (! empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%")
                            ->orWhere('country', 'like', "%{$search}%")
                            ->orWhereHas('city', function ($q) use ($search) {
                                $q->where('name', 'like', "%{$search}%");
                            });
                    });
                }
            }

            // Filters
            if ($request->has('city_id') && $request->city_id !== '') {
                $query->where('city_id', $request->city_id);
            }

            if ($request->has('country') && $request->country !== '') {
                $query->where('country', $request->country);
            }

            $perPage   = min((int) $request->get('perPage', $request->get('per_page', 10)), 100);
            $page      = (int) $request->get('page', 1);
            $paginated = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data'         => $paginated->map(function ($customer) {
                    $arr = $customer->toArray();
                    $arr['city_name'] = $customer->city ? $customer->city->name : null;
                    $arr['full_name'] = $customer->full_name;
                    return $arr;
                })->values(),
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Customer DataTable error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Find customer by ID
     */
    public function find($id)
    {
        return Customer::with(['city'])->findOrFail($id);
    }

    /**
     * Create new customer
     */
    public function store(array $data)
    {
        try {
            return Customer::create($data);
        } catch (\Exception $e) {
            Log::error('Customer creation error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update customer
     */
    public function update($id, array $data)
    {
        try {
            $customer = $this->find($id);
            $customer->update($data);

            return $customer;
        } catch (\Exception $e) {
            Log::error('Customer update error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete customer
     */
    public function delete($id)
    {
        try {
            $customer = $this->find($id);

            return $customer->delete();
        } catch (\Exception $e) {
            Log::error('Customer deletion error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Search customers (for live search)
     */
    public function search($searchTerm, $limit = 20)
    {
        try {
            return Customer::query()
                ->where(function ($query) use ($searchTerm) {
                    $query->where('first_name', 'like', "%{$searchTerm}%")
                        ->orWhere('last_name', 'like', "%{$searchTerm}%")
                        ->orWhere('phone', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
                })
                ->limit($limit)
                ->get(['id', 'first_name', 'last_name', 'phone', 'email']);
        } catch (\Exception $e) {
            Log::error('Customer search error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get customer statistics
     */
    public function getStats()
    {
        return [
            'total' => Customer::count(),
            'withEmail' => Customer::whereNotNull('email')->count(),
            'cities' => Customer::distinct('city_id')->whereNotNull('city_id')->count(),
            'countries' => Customer::distinct('country')->whereNotNull('country')->count(),
        ];
    }

    /**
     * Bulk delete customers
     */
    public function bulkDelete(array $ids)
    {
        try {
            return Customer::whereIn('id', $ids)->delete();
        } catch (\Exception $e) {
            Log::error('Customer bulk delete error: '.$e->getMessage());
            throw $e;
        }
    }
}
