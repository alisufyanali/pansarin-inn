<?php

namespace App\Http\Controllers\API;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateSetting;
use App\Models\Customer;
use App\Models\User;
use App\Services\AffiliateService;
use App\Services\CustomerIdentityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Storefront side of the referral affiliate program.
 * Applications start as 'pending'; an admin approves them in the admin panel,
 * after which the affiliate signs in to the /affiliate dashboard (Laravel).
 */
class AffiliateApiController extends Controller
{
    public function __construct(
        protected CustomerIdentityService $identity,
        protected AffiliateService $affiliates,
    ) {}

    // POST /api/affiliate/apply — public: creates the account and a pending application
    public function apply(Request $request)
    {
        try {
            $data = $request->validate(array_merge([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|max:255',
                'phone'    => 'required|string|max:30',
                'password' => ['required', 'confirmed', Password::defaults()],
            ], $this->applicationRules()));
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $phone = PhoneHelper::normalize($data['phone']);
        if (! $phone) {
            return $this->fieldError('phone', 'Invalid Pakistani mobile number. Use format 03XXXXXXXXX.');
        }

        // Existing accounts must sign in first — an application must never attach to someone else's account
        $exists = User::where('username', $phone)->orWhere('phone', $phone)->orWhere('email', $data['email'])->exists()
            || Customer::where('phone', $phone)->whereNotNull('user_id')->exists();
        if ($exists) {
            return $this->fieldError('email', 'An account with this phone or email already exists. Please log in and apply from the Affiliate page.');
        }

        $affiliate = DB::transaction(function () use ($data, $phone) {
            $parts = preg_split('/\s+/', trim($data['name']), 2);
            [$user] = $this->identity->findOrCreateByPhone($phone, [
                'first_name' => $parts[0],
                'last_name'  => $parts[1] ?? null,
                'email'      => $data['email'],
                'status'     => 'active',
            ]);

            $user->update([
                'email'                => $data['email'],
                'password'             => Hash::make($data['password']),
                'must_change_password' => false,
            ]);

            return $this->createApplication($user, $data);
        });

        return response()->json([
            'success' => true,
            'message' => 'Application received! We will review it and let you know once it is approved.',
            'data'    => $this->statusPayload($affiliate),
        ], 201);
    }

    // POST /api/affiliate/apply-me — signed-in customer applies with their own account
    public function applyAuthenticated(Request $request)
    {
        try {
            $data = $request->validate($this->applicationRules());
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $user = $request->user();
        if ($existing = Affiliate::where('user_id', $user->id)->first()) {
            return response()->json([
                'success' => true,
                'message' => 'You have already applied.',
                'data'    => $this->statusPayload($existing),
            ]);
        }

        $affiliate = DB::transaction(fn () => $this->createApplication($user, $data));

        return response()->json([
            'success' => true,
            'message' => 'Application received! We will review it and let you know once it is approved.',
            'data'    => $this->statusPayload($affiliate),
        ], 201);
    }

    // GET /api/affiliate/status — signed-in: the current user's application
    public function status(Request $request)
    {
        $affiliate = Affiliate::where('user_id', $request->user()->id)->first();

        return response()->json([
            'success' => true,
            'data'    => $affiliate ? $this->statusPayload($affiliate) : ['applied' => false],
        ]);
    }

    // POST /api/affiliate/click — public: a visit through ?ref=CODE
    public function click(Request $request)
    {
        $request->validate([
            'ref'      => 'required|string|max:50',
            'url'      => 'nullable|string|max:500',
            'referrer' => 'nullable|string|max:500',
        ]);

        $affiliate = $this->affiliates->activeAffiliateByCode($request->ref);
        if (! $affiliate) {
            return response()->json(['success' => true, 'data' => ['valid' => false]]);
        }

        try {
            $this->affiliates->recordClick($affiliate, [
                'url'        => $request->url,
                'referrer'   => $request->referrer,
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Affiliate click not recorded: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'valid'       => true,
                'code'        => $affiliate->affiliate_code,
                'cookie_days' => (int) (AffiliateSetting::where('key', 'cookie_duration')->value('value') ?? 30),
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private function applicationRules(): array
    {
        return [
            'payment_method'        => 'nullable|string|max:50',
            'payment_account_title' => 'nullable|string|max:255',
            'payment_account_no'    => 'nullable|string|max:100',
            'payment_iban'          => 'nullable|string|max:50',
            'about'                 => 'nullable|string|max:1000',
        ];
    }

    private function createApplication(User $user, array $data): Affiliate
    {
        $affiliate = Affiliate::create([
            'user_id'                    => $user->id,
            'affiliate_code'             => Affiliate::generateCode(),
            'status'                     => 'pending',
            'payment_method'             => $data['payment_method'] ?? null,
            'payment_account_title'      => $data['payment_account_title'] ?? null,
            'payment_account_no_details' => $data['payment_account_no'] ?? null,
            'payment_iban_details'       => $data['payment_iban'] ?? null,
            'notes'                      => $data['about'] ?? null,
        ]);

        try {
            foreach (User::role('admin')->get() as $admin) {
                $admin->notify(new \App\Notifications\NewAffiliateApplicationNotification($affiliate));
            }
        } catch (\Throwable $e) {
            Log::error('NewAffiliateApplicationNotification failed: ' . $e->getMessage());
        }

        return $affiliate;
    }

    private function statusPayload(Affiliate $affiliate): array
    {
        return [
            'applied'       => true,
            'status'        => $affiliate->status, // pending | active | blocked
            'code'          => $affiliate->isActive() ? $affiliate->affiliate_code : null,
            'dashboard_url' => url('/affiliate/dashboard'),
            'login_url'     => url('/login'),
        ];
    }

    private function validationError(ValidationException $e)
    {
        return response()->json([
            'success' => false,
            'message' => collect($e->errors())->flatten()->first(),
            'errors'  => $e->errors(),
        ], 422);
    }

    private function fieldError(string $field, string $message)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => [$field => [$message]],
        ], 422);
    }
}
