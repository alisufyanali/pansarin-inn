# Coding Rules — Pansari Inn

## Conventions (extracted from codebase)

### Naming
- **Controllers**: `{Domain}Controller` (Admin namespace: `App\Http\Controllers\Admin\`, API: `App\Http\Controllers\API\`)
- **Repositories**: `{Domain}Repository` in `app/Http/Repositories/Admin/` — one per domain
- **Requests**: `{Domain}Request` in `app/Http/Requests/Admin/` — FormRequest for all admin writes
- **Routes**: admin named `admin.{resource}.{action}`, API routes use camelCase controller methods
- **Tables**: snake_case plural. Pivot tables: alphabetical order or descriptive (`deal_product`, `product_health_concern`)
- **Migrations**: prefixed with date, descriptive suffix

### Repository Pattern
- All DB reads/writes go through a Repository — never raw Eloquent in controllers
- Repositories wrap multi-step writes in `DB::transaction()`
- `find($id)` throws `ModelNotFoundException` (let exception shield handle 404)
- DataTable/list methods return a paginated collection with `perPage` clamped to 1–100

### Validation
- Admin writes use `FormRequest` classes (extend `Illuminate\Foundation\Http\FormRequest`)
- API writes use inline `$request->validate()` or `validator($input, $rules)->validate()` inside try/catch
- Catch `ValidationException` and return 422 JSON — never let it bubble as HTML to API callers

### API Response Shape
All API responses follow this envelope:
```json
{
  "success": true|false,
  "message": "Human readable string",   // present on errors + some success
  "data": { ... } | [ ... ]             // present on success
}
```
- Error 422: add `"errors": {"field": ["message"]}` alongside `message`
- Error 401/403/404/500: no `data` key, just `success: false` + `message`
- Pagination: include `meta: {total, per_page, current_page, last_page}` alongside `data`

### Transactions
- Use `DB::transaction()` for any write that touches >1 table
- Customer + User creation goes through `CustomerIdentityService` (handles the unique-phone race)
- `UniqueConstraintViolationException` caught → re-fetch instead of failing

### Services
- Business logic that is shared between API and admin lives in `app/Services/` (pricing, deals, affiliate, identity, WhatsApp, courier)
- Controllers stay thin: validate → service/repository → JSON / Inertia

### Eager Loading / N+1
- Always eager-load relationships used in loops: `Order::with(['items.product', 'items.variant', 'customer', 'city'])`
- Pre-load collections before loops in syncItems() — 3 queries for N items, not N+3
- DataTable queries add `withCount()` rather than lazy counting

---

## Hard Rules (from past bugs)

### 1. Products have no price — variants do
- The `products` table has **no** price / sale_price column
- Selling price of a variant = `sale_price ?? price`; customer pays `final_price = (sale_price ?? price) + additional`
- Product "from" price = min variant `final_price`
- Never read `$product->price` / `$product->sale_price` (they are null) — the old affiliate dashboard crashed on `products.sale_price`

### 2. Always use `slug`, never generate slug from `name`
- Product, category, blog slugs are pre-set at import time and indexed for SEO
- Never re-generate with `Str::slug($product->name)` — it will produce a different string and break URLs
- The API uses `{slug}` as the lookup parameter everywhere

### 3. Never return `$e->getMessage()` to users
- Always: `Log::error('context', ['message' => $e->getMessage(), 'trace' => ...])` + generic response
- Return: `"Something went wrong. Please try again or contact support."` (or domain-specific generic)
- Exception: intentional business-rule exceptions thrown by repositories (e.g., wishlist duplicate, stock validation) may pass their message through — these are explicitly user-facing `ValidationException` or `\Exception` with crafted messages

### 4. No MySQL-only SQL functions
- Avoid `GROUP_CONCAT`, `DATE_FORMAT`, MySQL-specific window functions
- Use Laravel collection methods or DB-agnostic query builder equivalents
- Rationale: development uses MySQL but any SQLite-based testing or future migration must not break

### 5. Phone normalization — one canonical path
- Normalize ALL phone numbers through `App\Helpers\PhoneHelper::normalize()` before storing or looking up
- Canonical stored format: **`923XXXXXXXXX`** (12 digits, no `+`) — `normalize('03001234567')`, `normalize('+923001234567')` and `normalize('923001234567')` all return `923001234567`
- `normalize()` returns `null` for invalid numbers → return 422 with `errors.phone`
- Stored in `users.username`, `users.phone`, `customers.phone`, `orders.customer_phone`
- Applies to: login, register, checkout, profile, affiliate apply, imports, seeders

### 6. Customer resolution — only through `CustomerIdentityService`
- `findOrCreateByPhone($normalizedPhone, $profile)` returns `[User, Customer, wasCreated]`; it links legacy customers (`user_id = null`), creates wallet + loyalty rows and handles the unique-phone race
- Never `Customer::create()` / `User::create()` for a customer elsewhere
- Never let an unauthenticated request act on an **existing** account found by phone (no tokens, no password changes, no referral re-assignment) — see `/api/register` and guest orders

### 7. `HasTotals::calculateTotals()` — product_discount is NOT subtracted
```
grand_total = subtotal - invoice_discount + shipping_charges + totalsExtraCharge()
```
- `subtotal = SUM(item.subtotal)` where each `item.subtotal = (price × qty) - item.discount`
- `product_discount` is stored for reporting/display only — it is already embedded in item subtotals
- Adding `- $this->product_discount` causes double-subtraction

### 8. Avoid N+1 — add indexes for filtered columns
- Any column used in `WHERE`, `ORDER BY`, or as join key needs a DB index
- Check `EXPLAIN` output before adding new filtered queries to hot paths
- Use `withCount()` not a separate query per row

### 9. Server-side pagination meta — never client-side
- Always return `meta: {total, per_page, current_page, last_page}` from the API
- Frontend uses `meta.total` from the API response for counts — never `data.length`
- Admin DataTable wrapper fetches from `{resource}-data` endpoint and uses the `total` field

### 10. Diagnosis first — never claim done without evidence
Workflow for any bug fix:
1. Read the actual code (never guess)
2. Reproduce the issue with real data or command output
3. Apply the targeted fix
4. Verify with a command / DB query / actual response — include the output as proof
5. Update `tasks.md` and `memory.md`

Never say "done" and submit without running verification.

### 11. File uploads — use `$file->move()` not `->store()`
- Production server lacks the PHP `fileinfo` extension
- `->store('folder', 'public')` triggers Flysystem MIME detection → `Class "finfo" not found`
- Always use the native pattern:
  ```php
  $file->move(public_path('storage/' . $folder), $filename);
  return $folder . '/' . $filename;
  ```
- Old-file deletion: `unlink(public_path('storage/' . $relativePath))` + `file_exists()` guard

### 12. Never trust money from the client
- Storefront order totals come only from `CheckoutPricingService` (prices, deals, coupon, shipping). Client `price` is only a hint; `discount`, `invoice_discount`, `shipping_charges`, `tax` are ignored
- Coupon / deal usage is counted inside the order transaction with row locks (`OrderRepository::redeemCoupon/redeemDeals`) and released on cancel
- Anything touching stock must be idempotent (net-based inventory references) and lock `product_stocks` rows

### 13. Admin access = `staff` + permission
- Every `/admin` route group has `auth, verified, staff`; every controller action must also have a `permission:` middleware (`$this->middleware('permission:x')->only([...])`)
- Customer/affiliate roles carry some `view.*` permissions — never rely on permission alone for admin pages
- New admin methods: add them to the controller's `->only([...])` lists

### 14. Request input hygiene
- `per_page`: clamp `min(max((int) ..., 1), 50)` (100 for admin/products)
- Sort columns from the request go through `App\Support\SortInput::column()/direction()`
- Public write endpoints need a named rate limiter (`api.forms`, `api.reviews`, `api.coupons`, `api.guest-orders`) — never numeric `throttle:x,1` (shared bucket)

### 15. `must_change_password` flow
- Guest checkout sets `must_change_password = true` on the auto-created user
- `EnsurePasswordChanged` middleware (alias `password.changed`) blocks all auth:sanctum routes except `password.change` and `api.logout`
- Change-password endpoint: validates current_password, new password ≠ customer phone, sets `must_change_password = false`
- Login response always includes `must_change_password: bool`

### 17. Variant labels always come from `ProductVariant::label($unit)`
- Format: first non-Form attribute + product unit, then the rest: `250 gm / Powder`, `30 ml`, `100 gm`, `1 Pc` (a value that already has letters, like `1 Pack`, gets no extra unit)
- Used for `order_items.meta.variant_name`, `sale_items.meta.variant_name`, admin forms, cart/wishlist API, emails
- Never build labels inline with `collect($attrs)->values()->join(' / ')`; product API `variants[].name` stays raw (the storefront adds the unit with `withUnit()`)
- Old items: `php artisan orders:fix-variant-labels --dry-run` then without `--dry-run`

### 16. Tests
- Run with PHP 8.4: `D:\laragon\bin\php\php-8.4\php.exe vendor/bin/pest` (SQLite in-memory; Laragon's default PHP 8.2 fails composer's platform check)
- Every bug fix / feature adds a Pest test; the suite must be green before committing
