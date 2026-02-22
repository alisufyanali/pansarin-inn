<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CustomerRepository;
use App\Http\Requests\Admin\CustomerRequest;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerController extends Controller
{
    protected $customerRepository;

    public function __construct(CustomerRepository $customerRepository)
    {
        $this->customerRepository = $customerRepository;
        $this->middleware('permission:create.customers')->only(['create', 'store']);
        $this->middleware('permission:edit.customers')->only(['edit', 'update']);
        $this->middleware('permission:delete.customers')->only(['destroy']);
        $this->middleware('permission:view.customers')->only(['index', 'show', 'getData']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $stats = $this->customerRepository->getStats();

            return Inertia::render('Admin/Customers/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Customer index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load customers.');
        }
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        try {
            return $this->customerRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Customer getData error: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Customers/Create', [
                'cities' => City::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Customer create error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to load create form.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request)
    {
        try {
            $validated = $request->validated();

            $this->customerRepository->store($validated);

            return to_route('admin.customers.index')->with('success', 'Customer successfully created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Customer creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create customer.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $customer = $this->customerRepository->find($id);

            return Inertia::render('Admin/Customers/Show', [
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            Log::error('Customer show error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to load customer.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $customer = $this->customerRepository->find($id);

            return Inertia::render('Admin/Customers/Edit', [
                'customer' => $customer,
                'cities' => City::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Customer edit error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to load customer.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $this->customerRepository->update($id, $validated);

            return to_route('admin.customers.index')->with('success', 'Customer successfully updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Customer update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update customer.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->customerRepository->delete($id);

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customer successfully deleted!');
        } catch (\Exception $e) {
            Log::error('Customer deletion error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to delete customer.');
        }
    }

    /**
     * Search customers (for live search in orders)
     */
    public function search(Request $request)
    {
        try {
            $search = $request->get('q', '');
            $customers = $this->customerRepository->search($search);

            return response()->json($customers);
        } catch (\Exception $e) {
            Log::error('Customer search error: '.$e->getMessage());

            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    /**
     * Bulk delete customers
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:customers,id',
            ]);

            $count = $this->customerRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' customers deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Customer bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete customers.');
        }
    }
}
