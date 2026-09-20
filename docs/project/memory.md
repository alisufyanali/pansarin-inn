# Project Memory — Pansari Inn

## Context

- **Owner / dev**: "Master dev" — single developer, works via Claude prompts pasted into Cursor IDE
- **Language preference**: Hinglish (mix of Urdu and English), concise output preferred
- **Workflow**: diagnose first → targeted fix → verify with real output → update docs

---

## Key Decisions (and why)

| Decision | Rationale |
|---|---|
| `products.price` not used — variant prices only | Variants have always carried the real price; the `products.price` column is a legacy artifact from the original model. `getDiscountedPriceAttribute()` explicitly states this and falls back to `variants->min('price')` |
| `grand_total = subtotal − invoice_discount + shipping` (product_discount excluded) | Each `order_item.subtotal = (price × qty) − item.discount`; summing these gives an already-net subtotal. Adding `- product_discount` again was double-counting. Fixed in `HasTotals::calculateTotals()`. |
| Phone canonical format `03XXXXXXXXX` (not `+92`) | All existing customers stored in `03X` format; `PhoneHelper::normalize()` converts from any format. Used as password for auto-accounts so display and hash always match. |
| `resolveOrCreateCustomerProfileInTx()` split from `resolveOrCreateCustomerProfile()` | Guest checkout had a race condition: user-resolution transaction ended before customer creation, leaving a gap for concurrent requests to both pass `where('user_id')` null check and race to `create()`. Single outer transaction eliminates this. |
| Native `$file->move()` instead of `Storage::put()` for uploads | Production server (shared Hostinger) lacks PHP `fileinfo` extension. Flysystem calls `finfo_file()` for MIME detection. `$file->move()` uses `move_uploaded_file()` — no MIME detection, no finfo. |
| `EnsurePasswordChanged` on auth:sanctum group only | Admin uses Fortify web auth (separate session), not Sanctum tokens. The middleware only applies to API token routes. |
| `LOGIN` field accepts email or phone | Customers given their phone numbers as passwords (auto-accounts). Phone login enables them to authenticate without knowing their email. Backward-compatible: `email` field still accepted. |
| `BUILD_API_TOKEN` rate limiter bypass | Next.js static generation hits hundreds of product/category pages during `next build`. Without the bypass, the build would be rate-limited. Token never appears in client-side code. |
| Sequences table starting at 50000 | Order numbers start at ORDER-50001, matching legacy CodeIgniter numbering so old order references remain valid when customers migrate. |

---

## Known Gotchas

- **`LoyaltyPointTransaction` model class missing** — `Customer::loyaltyTransactions()` references this class but the file doesn't exist. The table is `point_transactions`. Don't call this relationship until the model is created.
- **`customers.user_id` can be null** — legacy CodeIgniter customers imported without creating User accounts. Normal for old data. Do not treat null user_id as an error condition.
- **AdminSeeder runs in production** — `DatabaseSeeder` calls it unconditionally. If `php artisan db:seed` is ever run on production, it will create test users. Needs a guard.
- **`product_variants.attributes` can be null or `{}`** — some products were imported from flat JSON without proper attributes. Use `BackfillFlatVariantAttributes` command for known SKUs. The `getVariantNameAttribute()` accessor falls back to `value` then `sku`.
- **`$this->attributes` in Eloquent models** — This refers to Eloquent's internal raw attribute bag, NOT a JSON column named `attributes`. Always use `$this->getAttribute('attributes')` when accessing a JSON column named `attributes` from inside an accessor.
- **Fortify is for admin web only** — Admin login at `/login` uses Fortify. Customer login uses `POST /api/login` (Sanctum). The two auth systems are completely separate.
- **WhatsApp media download uses `Storage::disk('public')->put()`** — This writes raw binary string content, not an UploadedFile. No MIME detection occurs on this path; the `fileinfo` fix does not apply here.
- **QUEUE_CONNECTION=sync** — All mail and WhatsApp jobs run synchronously. Mail failures are wrapped in try/catch so they never block order creation. On VPS migration, change to database/redis.
- **`sale_code` derived from `order_number`** — `Sale::booted()` generates sale_code as `SALE-{N}` from the order number's suffix, with `-2`, `-3` suffixes for multiple sales per order.

---

## Data Issues (Discovered)

- **All 20 existing orders in DB were seeded with 5% tax** — `OrderSeeder` applied `$tax = $subtotal * 0.05`. The production API sets `tax = 0` for new orders. Existing seeded orders have a stale `grand_total` that included this tax.
- **`customers` imported from legacy CI** — `customers.user_id` is null for these. Legacy ID mapping stored at `storage/app/legacy_customer_id_map.json`. Phone numbers may be in various formats — normalization during import is critical.
- **`product_reviews` seeder had 1-star and 2-star reviews** — Fixed: new distribution is 55–60% five-star, 35% four-star, 10% three-star, 0% one/two-star. Overall average ~4.45.

---

## Legacy Import Notes

- **Source**: CodeIgniter-era database export in `database/seeders/data/customers.json`
- **`user_id = null` by design**: imported customers have no User account — they are "phone-only" customers from the legacy system
- **Legacy ID map**: `storage/app/legacy_customer_id_map.json` — maps old CI customer IDs to new Laravel IDs for cross-reference
- **`CustomerImportSeeder`**: reads the JSON, normalizes phones, skips duplicates, maps city by name. Currently incomplete (see P0 tasks).

---

## Open Decisions

- [ ] **Manjistha merge**: Two products both named "Manjistha - Majith Powder" with different thumbnails/variants. Which record is canonical? Do historical orders referencing the non-canonical one need migration?
- [ ] **VPS migration**: Move from shared Hostinger to VPS to enable supervisor + queue workers + proper cron. Decision pending cost/complexity analysis.
- [ ] **FRONTEND_URL_2**: Second frontend URL env var. Purpose unclear — possibly Vercel preview deployment URL. Confirm before removing.
- [ ] **Wallet UI**: Wallet model and DB are complete. No customer-facing wallet UI exists in the Next.js frontend. Decide if it's a P1 feature.

---

## Session Log

<!-- Append dated one-liners after each work session -->

| Date | Summary |
|---|---|
| 2026-09-03 | Initial knowledge base created from full codebase scan |
