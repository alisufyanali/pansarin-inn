# Tasks & Progress — Pansari Inn

## DONE

- [x] Security / performance audit (N+1 fixes, eager loading, exception shield)
- [x] Admin: Returns module (admin CRUD, status updates)
- [x] Admin: Loyalty Points module (balance view, adjust, settings, history)
- [x] Admin: Reports module (summary, sales-over-time, top products/customers, category sales, payment breakdown, returns rate, affiliate performance)
- [x] Admin: Dashboard KPIs (orders, revenue, pending counts)
- [x] Admin: Health Concern module (CRUD + pivot to products)
- [x] SQLite-compatibility fixes (DB-agnostic queries, no MySQL-only functions)
- [x] Shop pagination / filter / sort (API + frontend)
- [x] SEO URL migration: `/{slug}` product routes, 308 redirects from legacy paths
- [x] Dynamic product detail page (variants, gallery, attributes)
- [x] Newsletter API (subscribe, verify, welcome email)
- [x] Order confirmation email (items, variant, totals, shipping address)
- [x] WhatsApp order notification (on order create + sale create)
- [x] Phone normalization: `PhoneHelper::normalize()` — canonical `03XXXXXXXXX` format
- [x] Slug-mismatch fix (never generate slug from name; use stored slug)
- [x] Health Concern seeding (`HealthConcernSeeder`, `HealthConcernProductSeeder`)
- [x] Static pages (pages table, admin CRUD)
- [x] Search debounce (admin DataTable search)
- [x] `/{category}/{slug}` product route
- [x] Variant selector fix (single-attribute variants: Weight-only, no Form)
- [x] Variant display fix: `ProductVariant::getVariantNameAttribute()` — fixed `$this->attributes` Eloquent bag collision
- [x] `BackfillFlatVariantAttributes` artisan command (18 SKUs with missing attributes JSON)
- [x] Build-time optimization: React cache in Next.js build
- [x] `BUILD_API_TOKEN` rate limiter: `api.public` named limiter with 1000/min bypass via `X-Build-Token` header
- [x] `products.price` column removal fixes: pricing via variants only; `getDiscountedPriceAttribute()` uses variant price
- [x] Dummy product review seeder (`ProductReviewSeeder`): min 3 reviews/product, 4.5 avg rating, Pakistani names
- [x] Customer checkout crash fix: `resolveOrCreateCustomerProfile()` race condition on `customers.user_id` UNIQUE
- [x] Global exception shield in `bootstrap/app.php`: API Throwable → generic JSON, no leak
- [x] `EnsurePasswordChanged` middleware + `must_change_password` flow (User model, login response, change-password endpoint)
- [x] Login by phone: `AuthApiController::login()` accepts `login` field (email or phone), `Customer::where('phone', 'like', '%'.$last10)` lookup, exactly-1-match guard
- [x] Login rate limiter: `RateLimiter` per `identifier|IP`, 5 attempts, 60s lockout
- [x] `HasTotals::calculateTotals()` fix: removed double-subtract of `product_discount` from `grand_total`
- [x] Admin Orders: order dispatch list print (Order #, Name, Phone, City, Product Detail, Total Price)
- [x] File upload fix: replaced `->store()` / Flysystem with native `$file->move()` in all upload handlers (bypasses missing `fileinfo` extension)
- [x] Admin Orders: `customer_name`, `customer_email`, `customer_phone` in order API response
- [x] Guest email fixes: login URL → `FRONTEND_URL/login`; password hash format aligned with displayed value; unit/variant in order confirmation email
- [x] Admin: `$e->getMessage()` leaks removed from all controllers (generic messages + full Log::error)
- [x] `OldProductsImportSeeder`: flat JSON format `{label/value}` now handled — `BackfillFlatVariantAttributes` command is legacy safety net only
- [x] `VariantAttributesSeederTest`: 5 Pest tests confirm both JSON formats produce correct `attributes` + `value` (5/5 pass on SQLite `:memory:`)

---

## IN PROGRESS

- [x] `CustomerImportSeeder` fixes (see PENDING P0 below — partially done but issues remain)
  - 2026-09-28: fixed remaining data-safety gaps in `CustomerLegacyImportService`: DB phones matched by normalized value (`+92…` rows no longer slip through); `users.username/phone/email` collisions skipped + reported (`phone_taken_by_user`/`email_taken_by_user`) instead of crashing; per-row try/catch (`import_error`) so one bad row can't abort the run and lose the ID map; rescue path same checks; dry-run now reports DB duplicates. `run()` accepts optional `$dataPath`. `tests/Feature/CustomerLegacyImportTest.php` (6 tests; 5 fail on old code, all pass now).

---

## PENDING

### P0 — Critical / Blocking

- [ ] **Before production: WhatsApp OTP on first login / account claim** (phone-as-account default password is temporary)
- [x] **`CustomerImportSeeder` legacy ID map**: skipped duplicates should write to `storage/app/legacy_customer_id_map.json`; currently missing entries for skipped records
  - 2026-09-28: verified — legacy map written for skipped rows (service L183/197/232); asserted in `CustomerLegacyImportTest`
- [x] **`CustomerImportSeeder` phone normalization**: must use `PhoneHelper::normalize()` consistently; current `sanitizePhone()` may diverge
  - 2026-09-28: verified — `PhoneHelper::normalize()` used for JSON + (now) existing DB phones; no `sanitizePhone` left
- [x] **`CustomerImportSeeder` default customer group**: assign `CustomerGroup` where `is_default = true`
  - 2026-09-28: verified — default group assigned (service L105-111/L330); asserted in `CustomerLegacyImportTest`
- [x] **`CustomerImportSeeder` wallet/loyalty rows**: create `wallet` + `loyalty_points` rows for each imported customer (like AdminSeeder does)
  - 2026-09-28: already done in `CustomerLegacyImportService::importOne()` L342-343 (verified, no code change)
- [ ] **`AdminSeeder` production guard**: seeder runs unconditionally in `DatabaseSeeder`; must skip or abort if `APP_ENV=production` to prevent test data in production
- [x] **`LoyaltyPointTransaction` model class missing**: `app/Models/LoyaltyPointTransaction.php` does not exist; `Customer::loyaltyTransactions()` will fail; table is `point_transactions`
  - 2026-09-28: already done (commit 00c047d) — model exists, `$table = 'point_transactions'`; covered by `LoyaltyPointTransactionTest`. Note: duplicate `PointTransaction` model on same table — cleanup later.

### P1 — Important

- [x] **fileinfo upload fallback**: verify all remaining upload paths (WhatsApp media download uses `Storage::put()` with raw binary — different path, may be safe; confirm)
  - 2026-09-28: WhatsApp `put()` confirmed safe (string write, no MIME guess). Real gap was validation: `image`/`mimes` rules call Symfony MimeTypes (needs fileinfo). Added `App\Rules\SafeImage` (ext whitelist + `getimagesize()`, safe-SVG check) and replaced all 17 rules in 11 files. `php -l` pass; `tests/Feature/SafeImageRuleTest.php` added. SVG check hardened (DOM-based: banned elements, on*, href allowlist, CSS url/@import, DTD/XXE, PIs, no 512KB bypass) — 21 tests pass.
- [ ] **Frontend `X-Build-Token` wiring**: Next.js build must send `X-Build-Token: {BUILD_API_TOKEN}` header on all API calls during `next build`; Vercel env var `BUILD_API_TOKEN` must be set
- [ ] **Vercel env vars audit**: confirm `NEXT_PUBLIC_API_URL`, `BUILD_API_TOKEN`, and any other required vars are set in Vercel project settings
- [ ] **Manjistha product merge**: two products named "Manjistha" with different thumbnails; decision pending (which to keep, how to migrate orders referencing deleted product)
- [ ] **Guest checkout validation error display**: frontend shows no field-level errors on guest checkout failure
  - 2026-09-28: backend half done — invalid-phone 422 now also returns `errors.phone` (was message-only); test added in `GuestCheckoutTest`. Remaining: Next.js must render `errors.*` per field (frontend repo not connected).
- [ ] **Pakistan-only phone validation**: validated at API (`regex:/^\+92[0-9]{10}$/` in `storeGuest`); frontend does NOT enforce this — only a placeholder `+923000000000` in the WhatsApp settings field (`resources/js/pages/Admin/Settings/ui/marketing.tsx:40`); frontend enforcement is missing
  - 2026-09-28: note — backend now uses `PhoneHelper::normalize()` (not the regex above). Frontend work pending; frontend repo not connected this session.
- [x] **Blog category/tag article count = 0 bug**: root cause confirmed — `BlogApiController` has no endpoint to list categories/tags with article counts; `GET /api/blogs` returns category name/slug but no count; `BlogTagRepository::getAllForDataTable` does `withCount('blogs')` for admin only; fix requires adding a public `GET /api/blog-categories` (or similar) endpoint that returns categories with `blogs_count`
  - 2026-09-28: already done — `GET /api/blog-categories` + `/api/blog-tags` (`routes/api.php:66-67`, `BlogApiController.php:14-43`, published-only `withCount`), covered by `BlogPublicEndpointsTest`. Frontend consumption not verified.

### P2 — Nice to Have

- [ ] Add-to-cart toast in quick view — no quick-view component found in `resources/js/` (likely in the Next.js frontend repo, not this codebase)
- [ ] Review count on product card — **API already returns `reviews_count` and `reviews_avg_rating` in `GET /api/products` list response** (source: `ProductApiController.php:26`); this is a frontend display issue in the Next.js repo, not a missing API field
- [ ] Footer category links — no footer component found in `resources/js/` (frontend repo issue)
- [ ] Rewards page missing sections (wallet balance display, transaction history)
  - 2026-09-28: backend done — `GET /api/rewards` now adds `data.wallet_balance` (additive, non-breaking) and caps `per_page` at 50; history already paginated. Remaining: Next.js rewards page UI (frontend repo not connected).
- [ ] Banner sizing fix — correct aspect ratio for carousel/banner images (exact dimensions TODO: confirm from frontend repo; no 812×317 reference found in this codebase)
- [ ] Fresh Next.js SEO audit (meta tags, canonical URLs, structured data)
- [ ] Hostinger VPS decision (shared → VPS migration for queue workers, supervisor)
- [ ] Enable async queue (QUEUE_CONNECTION=database or redis) — blocked on VPS decision
- [ ] `BackfillPowderAdditional` command: verify if `additional=100` is correctly set for all Powder variants

---

## Found 2026-09-28 (not yet fixed unless noted)

- [x] `routes/frontend.php` imported `Controllers\Api\FrontendController` (dir is `API`) — worked on Windows, **fatal on Linux** (`route:list` crashed). Fixed casing.
- [x] `config/fortify.php` `home` was `/dashboard` (route doesn't exist → 404 after email verification). Now `/admin/dashboard`.
- [x] 11 stale starter-kit tests (dashboard route name, logout → login, strong-password rule, User SoftDeletes → `assertSoftDeleted`). Baseline on f01e5c3: 11 failed → now 110/110 pass.
- [ ] `BackfillPowderAdditional`: `lower(json_extract(...)) = 'powder'` matches 0 rows on MySQL (json_extract returns quoted value). Use `JSON_UNQUOTE` / `->where('attributes->Form', ...)`.
- [ ] Deploy checklist step 4 SQL: missing parentheses — `AND deleted_at IS NULL` only binds to 2nd OR group.
- [ ] Duplicate models `PointTransaction` + `LoyaltyPointTransaction` on same table.
- [ ] `tsc --noEmit`: 91 pre-existing TypeScript errors in admin panel (build still succeeds).
- [ ] Uploaded SVGs are served from our origin — add `Content-Security-Policy: script-src 'none'` for `/storage/*.svg` as defense-in-depth.
- [ ] `routes/test.php` (run-seeder, place-order) only guarded by `APP_ENV=local` — confirm production `.env` has `APP_ENV=production`.

## Before Production Deploy — Checklist

Run in this order on every production deployment that includes migrations or seeder changes:

1. **Backup the production DB** before any migration or seed run.

2. **Run pending migrations:**
   ```bash
   php artisan migrate --force
   ```

3. **Run idempotent seeders** (safe to re-run — skip if already seeded):
   ```bash
   php artisan db:seed --class=RolePermissionSeeder --force
   php artisan db:seed --class=AdminSeeder --force        # guard: skip in production — see tasks P0
   php artisan db:seed --class=HealthConcernSeeder --force
   php artisan db:seed --class=CitySeeder --force
   ```
   > **Note:** `DatabaseSeeder` (`db:seed` with no class) runs `AdminSeeder` unconditionally — do NOT run it on production until the production-guard task is resolved (see P0 below).

4. **Verify zero empty-variant rows** (run on production DB, expected: 0 rows):
   ```sql
   SELECT sku, attributes, value
   FROM product_variants
   WHERE (attributes IS NULL OR attributes IN ('[]','{}',''))
      OR (value IS NULL OR TRIM(value) = '' OR value = '[]')
   AND deleted_at IS NULL;
   ```
   If any rows appear, run the backfill safety net:
   ```bash
   php artisan backfill:flat-variant-attributes
   ```

5. **Verify grand_total integrity** (run on production DB, expected: 0 rows with mismatch):
   ```sql
   SELECT id, order_number, grand_total,
          (subtotal - invoice_discount + shipping_charges + tax) AS correct_grand
   FROM orders
   WHERE ABS(grand_total - (subtotal - invoice_discount + shipping_charges + tax)) > 0.01
     AND deleted_at IS NULL;
   ```

6. **Clear caches:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   ```
