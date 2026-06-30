<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\NewsletterRepository;
use App\Http\Requests\Admin\NewsletterRequest;
use App\Mail\NewsletterWelcome;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    protected $newsletterRepository;

    public function __construct(NewsletterRepository $newsletterRepository)
    {
        $this->newsletterRepository = $newsletterRepository;
        $this->middleware('permission:view.newsletters')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.newsletters')->only(['create', 'store']);
        $this->middleware('permission:edit.newsletters')->only(['edit', 'update', 'updateStatus']);
        $this->middleware('permission:delete.newsletters')->only(['destroy', 'bulkDelete']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $stats = $this->newsletterRepository->getStats();

            return Inertia::render('Admin/Newsletters/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Newsletter index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load newsletters.');
        }
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        try {
            return $this->newsletterRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Newsletter getData error: '.$e->getMessage());

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
        return Inertia::render('Admin/Newsletters/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsletterRequest $request)
    {
        try {
            $validated = $request->validated();

            $newsletter = $this->newsletterRepository->store($validated);

            // Send welcome email to new subscriber
            if (($validated['status'] ?? 'active') === 'active') {
                try {
                    Mail::to($newsletter->email)
                        ->send(new NewsletterWelcome($newsletter->email, $newsletter->name ?? ''));
                } catch (\Throwable $e) {
                    Log::error('NewsletterWelcome mail dispatch failed: ' . $e->getMessage());
                }
            }

            return redirect()->route('admin.newsletters.index')
                ->with('success', 'Newsletter subscriber successfully created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Newsletter creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create newsletter subscriber.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Newsletter $newsletter)
    {
        try {
            return Inertia::render('Admin/Newsletters/Show', [
                'newsletter' => $newsletter,
            ]);
        } catch (\Exception $e) {
            Log::error('Newsletter show error: '.$e->getMessage());

            return redirect()->route('admin.newsletters.index')
                ->with('error', 'Failed to load newsletter subscriber.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Newsletter $newsletter)
    {
        try {
            return Inertia::render('Admin/Newsletters/Edit', [
                'newsletter' => $newsletter,
            ]);
        } catch (\Exception $e) {
            Log::error('Newsletter edit error: '.$e->getMessage());

            return redirect()->route('admin.newsletters.index')
                ->with('error', 'Failed to load newsletter subscriber.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NewsletterRequest $request, Newsletter $newsletter)
    {
        try {
            $validated = $request->validated();

            $this->newsletterRepository->update($newsletter->id, $validated);

            return redirect()->route('admin.newsletters.index')
                ->with('success', 'Newsletter subscriber successfully updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Newsletter update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update newsletter subscriber.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Newsletter $newsletter)
    {
        try {
            $this->newsletterRepository->delete($newsletter->id);

            return redirect()->route('admin.newsletters.index')
                ->with('success', 'Newsletter subscriber successfully deleted!');
        } catch (\Exception $e) {
            Log::error('Newsletter deletion error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete newsletter subscriber.');
        }
    }

    /**
     * Update newsletter status
     */
    public function updateStatus(Request $request, Newsletter $newsletter)
    {
        try {
            $request->validate([
                'status' => 'required|in:active,unsubscribed,bounced',
            ]);

            $this->newsletterRepository->updateStatus($newsletter->id, $request->status);

            return back()->with('success', 'Newsletter status updated!');
        } catch (\Exception $e) {
            Log::error('Newsletter status update error: '.$e->getMessage());

            return back()->with('error', 'Failed to update newsletter status.');
        }
    }

    /**
     * Bulk delete newsletters
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:newsletters,id',
            ]);

            $count = $this->newsletterRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' newsletter subscribers deleted!');
        } catch (\Exception $e) {
            Log::error('Newsletter bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete newsletter subscribers.');
        }
    }

    /**
     * Compose email form
     */
    public function compose()
    {
        $subscribers = Newsletter::where('status', 'active')
            ->select('id', 'email', 'name')
            ->orderBy('email')
            ->get();

        return Inertia::render('Admin/Newsletters/Compose', [
            'subscribers' => $subscribers,
        ]);
    }

    /**
     * Send composed email to subscribers
     */
    public function composeSend(Request $request)
    {
        $request->validate([
            'subject'  => 'required|string|max:255',
            'body'     => 'required|string',
            'send_to'  => 'required|in:all,specific',
            'emails'   => 'required_if:send_to,specific|array',
            'emails.*' => 'email',
        ]);

        $emails = $request->send_to === 'all'
            ? Newsletter::where('status', 'active')->pluck('email')
            : collect($request->emails);

        $sent = 0;
        foreach ($emails as $email) {
                try {
                    Mail::to($email)->send(new \App\Mail\CustomNewsletterMail(
                        $request->subject,
                        $request->body,
                        $email
                    ));
                    $sent++;
                } catch (\Exception $e) {
                    Log::warning("Failed to send newsletter for {$email}: " . $e->getMessage());
            }
        }

        return back()->with('success', "Email queued for {$sent} subscriber(s) successfully.");
    }

    /**
     * Return active subscribers list as JSON (for Compose page)
     */
    public function subscribersList()
    {
        $subscribers = Newsletter::where('status', 'active')
            ->select('id', 'email', 'name')
            ->orderBy('email')
            ->get();

        return response()->json($subscribers);
    }
}
