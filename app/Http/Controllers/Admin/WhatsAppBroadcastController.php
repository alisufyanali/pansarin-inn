<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendBulkWhatsAppMessage;
use App\Models\Customer;
use App\Models\WhatsappMessageLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WhatsAppBroadcastController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.whatsapp')->only(['index', 'customersList', 'recentLogs']);
        $this->middleware('permission:send.whatsapp')->only(['send']);
    }

    /**
     * Render the Bulk WhatsApp Message interface
     */
    public function index(Request $request)
    {
        // Fetch total and valid phone statistics
        $totalCustomers = Customer::count();
        $customersWithPhone = Customer::whereNotNull('phone')->where('phone', '!=', '')->count();

        // Recent broadcast logs for summary view
        $recentLogs = WhatsappMessageLog::where('order_id', 'like', 'BULK-%')
            ->latest()
            ->limit(20)
            ->get(['id', 'phone', 'customer_name', 'order_id', 'messages', 'api_response', 'created_at']);

        return Inertia::render('Admin/WhatsApp/Broadcast', [
            'totalCustomers'     => $totalCustomers,
            'customersWithPhone' => $customersWithPhone,
            'recentLogs'         => $recentLogs,
        ]);
    }

    /**
     * Return customer list with search & pagination for the UI picker
     */
    public function customersList(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $hasPhoneOnly = $request->boolean('has_phone', true);

        $query = Customer::query()
            ->select('id', 'first_name', 'last_name', 'phone', 'email', 'created_at')
            ->withCount('orders');

        if ($hasPhoneOnly) {
            $query->whereNotNull('phone')->where('phone', '!=', '');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
            });
        }

        $customers = $query->orderByDesc('id')->paginate(50);

        return response()->json($customers);
    }

    /**
     * Dispatch bulk WhatsApp messages
     */
    public function send(Request $request)
    {
        $request->validate([
            'customer_ids'   => 'required|array|min:1',
            'customer_ids.*' => 'integer|exists:customers,id',
            'message'        => 'required|string|min:2|max:1024',
            'send_mode'      => 'nullable|in:text,template',
            'template_name'  => 'nullable|string',
        ]);

        $customerIds = array_unique($request->input('customer_ids', []));
        $messageText = trim($request->input('message'));
        $sendMode = $request->input('send_mode', 'text');
        $templateName = $request->input('template_name');

        $dispatched = 0;

        foreach ($customerIds as $customerId) {
            SendBulkWhatsAppMessage::dispatch(
                (int) $customerId,
                $messageText,
                $sendMode,
                $templateName
            );
            $dispatched++;
        }

        Log::info("Bulk WhatsApp broadcast queued", [
            'dispatched_count' => $dispatched,
            'mode'             => $sendMode,
            'admin_user_id'    => auth()->id(),
        ]);

        return back()->with('success', "WhatsApp broadcast successfully dispatched for {$dispatched} customer(s)!");
    }

    /**
     * Fetch recent dispatch statistics & log outcomes
     */
    public function recentLogs()
    {
        $logs = WhatsappMessageLog::where('order_id', 'like', 'BULK-%')
            ->latest()
            ->limit(30)
            ->get();

        return response()->json($logs);
    }
}
