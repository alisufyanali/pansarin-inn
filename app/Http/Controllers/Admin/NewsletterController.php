<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class NewsletterController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:create.newsletters')->only(['create', 'store']);
        // $this->middleware('permission:edit.newsletters')->only(['edit', 'update']);
        // $this->middleware('permission:delete.newsletters')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $stats = [
            'total' => Newsletter::count(),
            'active' => Newsletter::where('status', 'active')->count(),
            'verified' => Newsletter::whereNotNull('verified_at')->count(),
        ];

        return Inertia::render('Admin/Newsletters/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        $query = Newsletter::query()->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%")
                      ->orWhere('source', 'like', "%{$search}%");
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                          ->orWhere('name', 'like', "%{$search}%")
                          ->orWhere('source', 'like', "%{$search}%");
                    });
                }
            }
        }
        
        // Status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Verification filter
        if ($request->has('verified') && $request->verified !== '') {
            if ($request->verified === 'yes') {
                $query->whereNotNull('verified_at');
            } else {
                $query->whereNull('verified_at');
            }
        }

        return DataTables::of($query)->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Newsletters/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletters,email',
            'name' => 'nullable|string|max:255',
            'status' => 'required|in:active,unsubscribed,bounced',
            'source' => 'nullable|string|max:255',
        ]);

        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        Newsletter::create($validated);

        return redirect()->route('newsletters.index')
            ->with('success', 'Newsletter subscriber successfully created!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Newsletter $newsletter)
    {
        return Inertia::render('Admin/Newsletters/Edit', [
            'newsletter' => $newsletter
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Newsletter $newsletter)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletters,email,' . $newsletter->id,
            'name' => 'nullable|string|max:255',
            'status' => 'required|in:active,unsubscribed,bounced',
            'source' => 'nullable|string|max:255',
        ]);

        $newsletter->update($validated);

        return redirect()->route('newsletters.index')
            ->with('success', 'Newsletter subscriber successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Newsletter $newsletter)
    {
        $newsletter->delete();
        
        return redirect()->route('newsletters.index')
            ->with('success', 'Newsletter subscriber successfully deleted!');
    }
}