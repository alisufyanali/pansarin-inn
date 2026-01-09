<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\City;
use Yajra\DataTables\Facades\DataTables;

class CustomerController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:create.customers')->only(['create', 'store']);
        // $this->middleware('permission:edit.customers')->only(['edit', 'update']);
        // $this->middleware('permission:delete.customers')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => Customer::count(),
            'withEmail' => Customer::whereNotNull('email')->count(),
            'cities' => Customer::distinct('city_id')->whereNotNull('city_id')->count(),
            'countries' => Customer::distinct('country')->whereNotNull('country')->count(),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }


    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        $query = Customer::with('city')->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhere('country', 'like', "%{$search}%")
                      ->orWhereHas('city', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%")
                          ->orWhere('address', 'like', "%{$search}%")
                          ->orWhere('country', 'like', "%{$search}%")
                          ->orWhereHas('city', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Filters
        if ($request->has('city_id') && $request->city_id !== '') {
            $query->where('city_id', $request->city_id);
        }
        
        if ($request->has('country') && $request->country !== '') {
            $query->where('country', $request->country);
        }

        return DataTables::of($query)
            ->addColumn('city_name', function($customer) {
                return $customer->city ? $customer->city->name : null;
            })
            ->addColumn('full_name', function($customer) {
                return $customer->full_name;
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Customers/Create', [
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'email' => 'nullable|email|max:255|unique:customers,email',
            'address' => 'nullable|string|max:255',
            'city_id' => 'nullable|exists:cities,id',
            'country' => 'nullable|string|max:100',
        ]);

        Customer::create($validated);

        return to_route('admin.customers.index')->with('success', 'Customer successfully created!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::with(['city'])->findOrFail($id);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $customer = Customer::with('city')->findOrFail($id);

        return Inertia::render('Admin/Customers/Edit', [
            'customer' => $customer,
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20|unique:customers,phone,' . $id,
            'email' => 'nullable|email|max:255|unique:customers,email,' . $id,
            'address' => 'nullable|string|max:255',
            'city_id' => 'nullable|exists:cities,id',
            'country' => 'nullable|string|max:100',
        ]);

        $customer->update($validated);

        return to_route('admin.customers.index')->with('success', 'Customer successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Customer::destroy($id);
            
            return redirect()->route('customers.index')
                ->with('success', 'Customer successfully deleted!');
                
        } catch (\Exception $e) {
            return redirect()->route('customers.index')
                ->with('error', 'Failed to delete customer: ' . $e->getMessage());
        }
    }

    /**
     * Search customers (for live search in orders)
     */
    public function search(Request $request)
    {
        $search = $request->get('q', '');
        
        $customers = Customer::query()
            ->where(function($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get(['id', 'first_name', 'last_name', 'phone', 'email']);

        return response()->json($customers);
    }
         
}