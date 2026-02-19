<?php

namespace App\Http\Repositories\Admin;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class ContactRepository
{
    /**
     * Get all contacts
     */
    public function getAll()
    {
        return Contact::with(['repliedByUser'])->latest()->get();
    }

    /**
     * Get DataTable data for contacts
     */
    public function getAllForDataTable(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Contact DataTable error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Find contact by ID
     */
    public function find($id)
    {
        return Contact::with(['repliedByUser'])->findOrFail($id);
    }

    /**
     * Create new contact
     */
    public function store(array $data, $userId = null)
    {
        try {
            DB::beginTransaction();
            
            $contact = Contact::create($data);

            // If there's an admin reply and status is replied, set replied_by
            if (!empty($data['admin_reply']) && $data['status'] === 'replied' && $userId) {
                $contact->update([
                    'replied_by' => $userId,
                    'replied_at' => now(),
                ]);
            }

            DB::commit();
            return $contact;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Contact creation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update contact
     */
    public function update($id, array $data)
    {
        try {
            DB::beginTransaction();
            
            $contact = $this->find($id);
            $contact->update($data);

            DB::commit();
            return $contact;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Contact update error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete contact
     */
    public function delete($id)
    {
        try {
            $contact = $this->find($id);
            return $contact->delete();
        } catch (\Exception $e) {
            Log::error('Contact deletion error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update contact status
     */
    public function updateStatus($id, $status)
    {
        try {
            $contact = $this->find($id);
            $contact->update(['status' => $status]);
            return $contact;
        } catch (\Exception $e) {
            Log::error('Contact status update error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Mark contact as read
     */
    public function markAsRead($id)
    {
        try {
            $contact = $this->find($id);
            $contact->markAsRead();
            return $contact;
        } catch (\Exception $e) {
            Log::error('Contact mark as read error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reply to contact
     */
    public function reply($id, $reply, $userId)
    {
        try {
            $contact = $this->find($id);
            $contact->markAsReplied($reply, $userId);
            return $contact;
        } catch (\Exception $e) {
            Log::error('Contact reply error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Bulk delete contacts
     */
    public function bulkDelete(array $ids)
    {
        try {
            return Contact::whereIn('id', $ids)->delete();
        } catch (\Exception $e) {
            Log::error('Contact bulk delete error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(array $ids, $status)
    {
        try {
            return Contact::whereIn('id', $ids)->update(['status' => $status]);
        } catch (\Exception $e) {
            Log::error('Contact bulk status update error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get contact statistics
     */
    public function getStats()
    {
        return [
            'total' => Contact::count(),
            'new' => Contact::where('status', 'new')->count(),
            'read' => Contact::where('status', 'read')->count(),
            'replied' => Contact::where('status', 'replied')->count(),
            'resolved' => Contact::where('status', 'resolved')->count(),
            'spam' => Contact::where('status', 'spam')->count(),
        ];
    }
}
