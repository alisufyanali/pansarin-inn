<?php

namespace App\Http\Repositories\Admin;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class NewsletterRepository
{
    /**
     * Get all newsletters
     */
    public function getAll()
    {
        return Newsletter::latest()->get();
    }

    /**
     * Get DataTable data for newsletters
     */
    public function getAllForDataTable(Request $request)
    {
        try {
            $query = Newsletter::query()->latest();

            // Search handling
            if ($request->has('search') && $request->search !== '') {
                if (is_string($request->search)) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('source', 'like', "%{$search}%");
                    });
                } elseif (is_array($request->search) && isset($request->search['value'])) {
                    $search = $request->search['value'];
                    if (! empty($search)) {
                        $query->where(function ($q) use ($search) {
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
        } catch (\Exception $e) {
            Log::error('Newsletter DataTable error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Find newsletter by ID
     */
    public function find($id)
    {
        return Newsletter::findOrFail($id);
    }

    /**
     * Create new newsletter subscriber
     */
    public function store(array $data)
    {
        try {
            return Newsletter::create($data);
        } catch (\Exception $e) {
            Log::error('Newsletter creation error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update newsletter subscriber
     */
    public function update($id, array $data)
    {
        try {
            $newsletter = $this->find($id);
            $newsletter->update($data);

            return $newsletter;
        } catch (\Exception $e) {
            Log::error('Newsletter update error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete newsletter subscriber
     */
    public function delete($id)
    {
        try {
            $newsletter = $this->find($id);

            return $newsletter->delete();
        } catch (\Exception $e) {
            Log::error('Newsletter deletion error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update newsletter status
     */
    public function updateStatus($id, $status)
    {
        try {
            $newsletter = $this->find($id);
            $newsletter->update(['status' => $status]);

            return $newsletter;
        } catch (\Exception $e) {
            Log::error('Newsletter status update error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify newsletter subscriber
     */
    public function verify($id)
    {
        try {
            $newsletter = $this->find($id);
            $newsletter->verify();

            return $newsletter;
        } catch (\Exception $e) {
            Log::error('Newsletter verification error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Bulk delete newsletters
     */
    public function bulkDelete(array $ids)
    {
        try {
            return Newsletter::whereIn('id', $ids)->delete();
        } catch (\Exception $e) {
            Log::error('Newsletter bulk delete error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get newsletter statistics
     */
    public function getStats()
    {
        return [
            'total' => Newsletter::count(),
            'active' => Newsletter::where('status', 'active')->count(),
            'verified' => Newsletter::whereNotNull('verified_at')->count(),
            'unsubscribed' => Newsletter::where('status', 'unsubscribed')->count(),
            'bounced' => Newsletter::where('status', 'bounced')->count(),
        ];
    }
}
