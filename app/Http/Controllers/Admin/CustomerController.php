<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CustomerRepository;
use App\Http\Requests\Admin\CustomerRequest;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Customer;
use App\Models\Country;
use App\Models\State;
use App\Models\City;
use App\Models\CustomerGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerController extends Controller
{
    protected $customerRepository;

    public function __construct(CustomerRepository $customerRepository) {
        $this->customerRepository = $customerRepository;
        $this->middleware('permission:create.customers')->only(['create', 'store']);
        $this->middleware('permission:edit.customers')->only(['edit', 'update']);
        $this->middleware('permission:delete.customers')->only(['destroy']);
        $this->middleware('permission:view.customers')->only(['index', 'show', 'getData']);
    }

    public function index(Request $request) {
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

    public function getData(Request $request) {
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

    public function create() {
        try {
            return Inertia::render('Admin/Customers/Create', [
                'cities' => City::orderBy('province')->orderBy('name')->get(['id', 'name', 'province']),
            ]);
        } catch (\Exception $e) {
            Log::error('Customer create error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to load create form.');
        }
    }

    public function store(CustomerRequest $request) {
        try {
            $validated = $request->validated();
            $customer = $this->customerRepository->store($validated);

            if ($customer) {
                // Welcome Email
                if (!empty($customer->email)) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($customer->email)->send(new \App\Mail\CustomerWelcomeMail($customer));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('MAIL FAILED: Customer welcome email queue failed', [
                            'customer_id' => $customer->id,
                            'email' => $customer->email,
                            'message' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                            'file' => $e->getFile(),
                            'line' => $e->getLine(),
                        ]);
                    }
                }

                // Welcome WhatsApp
                if (!empty($customer->phone)) {
                    try {
                        \App\Jobs\SendCustomerWelcomeWhatsApp::dispatch($customer);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('WHATSAPP DISPATCH FAILED: Customer welcome WhatsApp failed to dispatch', [
                            'customer_id' => $customer->id,
                            'phone' => $customer->phone,
                            'message' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                            'file' => $e->getFile(),
                            'line' => $e->getLine(),
                        ]);
                    }
                }
            }

            return to_route('admin.customers.index')->with('success', 'Customer created!');
        } catch (\Exception $e) {
            Log::error('Customer store outer error: '.$e->getMessage());
            return back()->with('error', 'Something went wrong.');
        }
    }

    public function show(string $id) {
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

    public function edit(Customer $customer) {
        try {
            $customer->load('user');

            return Inertia::render('Admin/Customers/Edit', [
                'customer' => $customer,
                'cities' => City::orderBy('province')->orderBy('name')->get(['id', 'name', 'province']),
            ]);
        } catch (\Exception $e) {
            Log::error('Customer edit error: '.$e->getMessage());

            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to load customer.');
        }
    }

    // Fixed: Route Model Binding and raw ID fallback handling to ensure $customer object is resolved
    public function update(CustomerRequest $request, $customer)
    {
        try {
            if (is_numeric($customer) || is_string($customer)) {
                $customer = Customer::findOrFail($customer);
            }
            $this->customerRepository->update($customer, $request->validated());
            return to_route('admin.customers.index')->with('success', 'Customer updated successfully!');
        } catch (\Exception $e) {
            Log::error('Customer update error: ' . $e->getMessage());
            return back()->with('error', 'Failed to update customer.');
        }
    }

    public function destroy(Customer $customer) {
        try {
            $this->customerRepository->delete($customer);

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customer successfully deleted!');
        } catch (\Exception $e) {
            Log::error('Customer deletion error: '.$e->getMessage());
            return redirect()->route('admin.customers.index')
                ->with('error', 'Failed to delete customer.');
        }
    }

    public function search(Request $request) {
        try {
            $search = $request->get('q', '');
            $customers = $this->customerRepository->search($search);

            return response()->json($customers);
        } catch (\Exception $e) {
            Log::error('Customer search error: '.$e->getMessage());

            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    public function bulkDelete(Request $request) {
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