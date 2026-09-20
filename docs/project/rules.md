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
- DataTable/list methods return paginated collection; controllers call `->paginate(min((int) $request->perPage, 100))`

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
- Customer + User creation in `OrderApiController` wrapped in single outer transaction to prevent race on `customers.user_id` unique constraint
- `UniqueConstraintViolationException` caught inside transaction → re-fetch instead of failing

### Eager Loading / N+1
- Always eager-load relationships used in loops: `Order::with(['items.product', 'items.variant', 'customer', 'city'])`
- Pre-load collections before loops in syncItems() — 3 queries for N items, not N+3
- DataTable queries add `withCount()` rather than lazy counting

---

## Hard Rules (from past bugs)

### 1. `products.price` column does NOT exist for pricing
- The `products` table has a `price` column in `$fillable`/`$casts` but it is **not the source of truth**
- All pricing is in `product_variants.price` and `product_variants.sale_price`
- When you need a product price: `$product->variants->firstWhere('is_default', true)?->price ?? $product->variants->min('price')`
- Never read `$product->price` for display or calculation; it will be 0 or stale

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
- Normalize ALL phone numbers through `App\Helpers\PhoneHelper::normalize()` before DB storage
- Canonical format: `03XXXXXXXXX` (11 digits, starts with `03`)
- WhatsApp API format: `923XXXXXXXXX` via `PhoneHelper::toInternational()`
- Never store `+92...` or `92...` format in the `customers.phone` or `users.phone` columns
- Applies to: checkout, seeders, import scripts, uniquePhone() helper

### 6. Customer resolution — never blind `Customer::create()`
Use `resolveOrCreateCustomerProfileInTx()` pattern (from `OrderApiController`):
1. `Customer::where('user_id', $user->id)->first()` — return if exists
2. `Customer::where('email', $email)->first()` — if found with `user_id = null` AND `$user->email_verified_at !== null` → link it; else create with `email = null`
3. If email row has different non-null `user_id` → create with `email = null`
4. Wrap in DB::transaction; catch `UniqueConstraintViolationException` → re-fetch

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

### 12. `must_change_password` flow
- Guest checkout sets `must_change_password = true` on the auto-created user
- `EnsurePasswordChanged` middleware (alias `password.changed`) blocks all auth:sanctum routes except `password.change` and `api.logout`
- Change-password endpoint: validates current_password, new password ≠ customer phone, sets `must_change_password = false`
- Login response always includes `must_change_password: bool`
