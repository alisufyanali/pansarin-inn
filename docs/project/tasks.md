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

---

## IN PROGRESS

- [ ] `CustomerImportSeeder` fixes (see PENDING P0 below — partially done but issues remain)

---

## PENDING

### P0 — Critical / Blocking

- [ ] **`CustomerImportSeeder` legacy ID map**: skipped duplicates should write to `storage/app/legacy_customer_id_map.json`; currently missing entries for skipped records
- [ ] **`CustomerImportSeeder` phone normalization**: must use `PhoneHelper::normalize()` consistently; current `sanitizePhone()` may diverge
- [ ] **`CustomerImportSeeder` default customer group**: assign `CustomerGroup` where `is_default = true`
- [ ] **`CustomerImportSeeder` wallet/loyalty rows**: create `wallet` + `loyalty_points` rows for each imported customer (like AdminSeeder does)
- [ ] **`AdminSeeder` production guard**: seeder runs unconditionally in `DatabaseSeeder`; must skip or abort if `APP_ENV=production` to prevent test data in production
- [ ] **`LoyaltyPointTransaction` model class missing**: `app/Models/LoyaltyPointTransaction.php` does not exist; `Customer::loyaltyTransactions()` will fail; table is `point_transactions`

### P1 — Important

- [ ] **fileinfo upload fallback**: verify all remaining upload paths (WhatsApp media download uses `Storage::put()` with raw binary — different path, may be safe; confirm)
- [ ] **Frontend `X-Build-Token` wiring**: Next.js build must send `X-Build-Token: {BUILD_API_TOKEN}` header on all API calls during `next build`; Vercel env var `BUILD_API_TOKEN` must be set
- [ ] **Vercel env vars audit**: confirm `NEXT_PUBLIC_API_URL`, `BUILD_API_TOKEN`, and any other required vars are set in Vercel project settings
- [ ] **Manjistha product merge**: two products named "Manjistha" with different thumbnails; decision pending (which to keep, how to migrate orders referencing deleted product)
- [ ] **Guest checkout validation error display**: frontend shows no field-level errors on guest checkout failure
- [ ] **Pakistan-only phone validation**: frontend accepts any phone format; should enforce `^\+92[0-9]{10}$` before sending to API
- [ ] **Blog category/tag article count = 0 bug**: category and tag listing shows 0 articles

### P2 — Nice to Have

- [ ] Add-to-cart toast in quick view
- [ ] Review count on product card
- [ ] Footer category links
- [ ] Rewards page missing sections (wallet balance display, transaction history)
- [ ] Banner sizing fix (812×317 aspect ratio enforcement)
- [ ] Fresh Next.js SEO audit (meta tags, canonical URLs, structured data)
- [ ] Hostinger VPS decision (shared → VPS migration for queue workers, supervisor)
- [ ] Enable async queue (QUEUE_CONNECTION=database or redis) — blocked on VPS decision
- [ ] `BackfillPowderAdditional` command: verify if `additional=100` is correctly set for all Powder variants
