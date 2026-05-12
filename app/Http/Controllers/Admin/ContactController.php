<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ContactRepository;
use App\Http\Requests\Admin\ContactRequest;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ContactController extends Controller
{
    protected $contactRepository;

    public function __construct(ContactRepository $contactRepository)
    {
        $this->contactRepository = $contactRepository;
        $this->middleware('permission:view.contacts')->only(['index', 'show', 'getData']);
        $this->middleware('permission:edit.contacts')->only([
            'create',
            'store',
            'edit',
            'update',
            'updateStatus',
            'reply',
            'bulkUpdateStatus',
        ]);
        $this->middleware('permission:delete.contacts')->only(['destroy', 'bulkDelete']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $stats = $this->contactRepository->getStats();

            return Inertia::render('Admin/Contacts/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Contact index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load contacts.');
        }
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        try {
            return $this->contactRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Contact getData error: '.$e->getMessage());

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
        return Inertia::render('Admin/Contacts/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ContactRequest $request)
    {
        try {
            $validated = $request->validated();

            $this->contactRepository->store($validated, $request->user()->id);

            return to_route('admin.contacts.index')->with('success', 'Contact successfully created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Contact creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create contact.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $contact = $this->contactRepository->find($id);

            // Mark as read if status is new
            if ($contact->status === 'new') {
                $this->contactRepository->markAsRead($id);
                $contact->refresh();
            }

            return Inertia::render('Admin/Contacts/Show', [
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Contact show error: '.$e->getMessage());

            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to load contact.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $contact = $this->contactRepository->find($id);

            return Inertia::render('Admin/Contacts/Edit', [
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Contact edit error: '.$e->getMessage());

            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to load contact.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ContactRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $this->contactRepository->update($id, $validated);

            return to_route('admin.contacts.index')->with('success', 'Contact updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Contact update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update contact.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->contactRepository->delete($id);

            return redirect()->route('admin.contacts.index')
                ->with('success', 'Contact deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Contact deletion error: '.$e->getMessage());

            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to delete contact.');
        }
    }

    /**
     * Update contact status
     */
    public function updateStatus(Request $request, string $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:new,read,replied,resolved,spam',
            ]);

            $this->contactRepository->updateStatus($id, $request->status);

            return back()->with('success', 'Contact status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Contact status update error: '.$e->getMessage());

            return back()->with('error', 'Failed to update contact status.');
        }
    }

    /**
     * Reply to contact
     */
    public function reply(Request $request, string $id)
    {
        try {
            $request->validate([
                'admin_reply' => 'required|string',
            ]);

            $this->contactRepository->reply($id, $request->admin_reply, $request->user()->id);

            // TODO: Send email to customer with reply

            return back()->with('success', 'Reply sent successfully!');
        } catch (\Exception $e) {
            Log::error('Contact reply error: '.$e->getMessage());

            return back()->with('error', 'Failed to send reply.');
        }
    }

    /**
     * Bulk delete
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:contacts,id',
            ]);

            $count = $this->contactRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' contacts deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Contact bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete contacts.');
        }
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:contacts,id',
                'status' => 'required|in:new,read,replied,resolved,spam',
            ]);

            $count = $this->contactRepository->bulkUpdateStatus($request->ids, $request->status);

            return back()->with('success', $count.' contacts updated successfully!');
        } catch (\Exception $e) {
            Log::error('Contact bulk status update error: '.$e->getMessage());

            return back()->with('error', 'Failed to update contacts.');
        }
    }
}
