<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Contact;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:view.contacts')->only(['index', 'show', 'getData']);
        // $this->middleware('permission:edit.contacts')->only(['edit', 'update', 'updateStatus', 'reply']);
        // $this->middleware('permission:delete.contacts')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => Contact::count(),
            'new' => Contact::where('status', 'new')->count(),
            'read' => Contact::where('status', 'read')->count(),
            'replied' => Contact::where('status', 'replied')->count(),
            'resolved' => Contact::where('status', 'resolved')->count(),
        ];

        return Inertia::render('Admin/Contacts/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        $query = Contact::with(['repliedByUser'])->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%")
                          ->orWhere('subject', 'like', "%{$search}%")
                          ->orWhere('message', 'like', "%{$search}%");
                    });
                }
            }
        }
        
        // Filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        return DataTables::of($query)
            ->addColumn('replied_by_name', function($contact) {
                return $contact->repliedByUser ? $contact->repliedByUser->name : null;
            })
            ->make(true);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Contacts/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'status' => 'required|in:new,read,replied,resolved,spam',
                'admin_reply' => 'nullable|string',
            ]);

            DB::beginTransaction();
            
            $contact = Contact::create($validated);

            // If there's an admin reply and status is replied, set replied_by
            if (!empty($validated['admin_reply']) && $validated['status'] === 'replied') {
                $contact->update([
                    'replied_by' => $request->user()->id,
                    'replied_at' => now(),
                ]);
            }

            DB::commit();

            return to_route('admin.contacts.index')->with('success', 'Contact successfully created!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Contact creation error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create contact.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $contact = Contact::with(['repliedByUser'])->findOrFail($id);

        // Mark as read if status is new
        if ($contact->status === 'new') {
            $contact->markAsRead();
        }

        return Inertia::render('Admin/Contacts/Show', [
            'contact' => $contact
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $contact = Contact::with(['repliedByUser'])->findOrFail($id);

        return Inertia::render('Admin/Contacts/Edit', [
            'contact' => $contact,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'status' => 'required|in:new,read,replied,resolved,spam',
            'admin_reply' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $contact->update($validated);

            DB::commit();
            return to_route('admin.contacts.index')->with('success', 'Contact updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update contact: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Contact::destroy($id);
            
            return redirect()->route('admin.contacts.index')
                ->with('success', 'Contact deleted successfully!');
                
        } catch (\Exception $e) {
            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to delete contact: ' . $e->getMessage());
        }
    }

    /**
     * Update contact status
     */
    public function updateStatus(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied,resolved,spam',
        ]);

        $contact->update(['status' => $validated['status']]);

        return back()->with('success', 'Contact status updated successfully!');
    }

    /**
     * Reply to contact
     */
    public function reply(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);
        
        $validated = $request->validate([
            'admin_reply' => 'required|string',
        ]);

        $contact->markAsReplied($validated['admin_reply'], $request->user()->id);

        // TODO: Send email to customer with reply

        return back()->with('success', 'Reply sent successfully!');
    }

    /**
     * Bulk delete
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
        ]);

        Contact::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' contacts deleted successfully!');
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
            'status' => 'required|in:new,read,replied,resolved,spam',
        ]);

        Contact::whereIn('id', $validated['ids'])->update(['status' => $validated['status']]);

        return back()->with('success', count($validated['ids']) . ' contacts updated successfully!');
    }
}