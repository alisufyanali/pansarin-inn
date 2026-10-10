# Tasks & Progress — Pansari Inn (backend)

> Last updated: 2026-10-10. Test suite: 254 passing, 943 assertions (`php-8.4 vendor/bin/pest`).

## DONE

### Earlier (≤ 2026-09-28)
- [x] Security/performance audit (N+1, eager loading, exception shield, no `$e->getMessage()` leaks)
- [x] Admin modules: Returns, Loyalty, Reports, Dashboard KPIs, Health Concerns, static pages, order dispatch print
- [x] SEO URL migration support, `/{slug}` + `/{category}/{slug}` product routes
- [x] Newsletter API, order confirmation email, WhatsApp order/sale notifications
- [x] `PhoneHelper::normalize()` canonical phone, phone login, login rate limiter
- [x] `EnsurePasswordChanged` + `must_change_password` flow; guarded migration for `users.must_change_password`/`phone`
- [x] `HasTotals` double-subtract fix; guest checkout race fix
- [x] Uploads: native `$file->move()` + `SafeImage` rule (no fileinfo)
- [x] `BUILD_API_TOKEN` limiter; `GET /api/blog-categories`, `/api/blog-tags`; `/api/rewards` wallet_balance
- [x] Legacy customer import hardening (`CustomerLegacyImportService`, `customers:import`)
- [x] `AdminSeeder` skips in production; `LoyaltyPointTransaction` model exists

### 2026-09-29 — audit fixes
- [x] `/api/register` no longer hands out tokens / resets passwords for existing phones
- [x] Server-side order pricing; coupons enforced (`apply_to`, `usage_count`, `per_user_limit`, full end date); `orders.coupon_code`
- [x] `/admin` restricted to staff (`EnsureStaff`) + missing permission checks added
- [x] Stock: no double deduction on delivery; restock on cancel/delete/return completion; locked, duplicate-aware stock checks
- [x] Sale delivery/cancel mirrors to Order; `orders.delivered_at`; return window from real delivery date
- [x] Affiliate payout row lock; `/affiliate/register-customer` creates customer profile
- [x] Profile phone change syncs username + customer phone
- [x] WhatsApp webhook signature (`WHATSAPP_APP_SECRET`) + safe verify challenge
- [x] `per_page` clamps, `SortInput`, deactivated users can't log in, named rate limiters, 1 helpful vote/IP, low-stock alert on threshold crossing

### 2026-09-29 — Product Deals end-to-end
- [x] `DealPricingService`, `CheckoutPricingService`, `POST /api/checkout/quote`
- [x] `GET /api/deals`, `/api/deals/{slug}`; `deal`/`deal_price` on product, homepage, cart APIs
- [x] `order_items.deal_id`; `max_uses`, `max_uses_per_user`, `stock_limit`/`sold_count` enforced; released on cancel
- [x] Admin: toggle-status + duplicate routes, Edit crash (null discount) fixed, flash_sale/bundle value field, deal prefill in admin order/sale forms

### 2026-09-30
- [x] Variant labels with unit everywhere (`ProductVariant::label()`): orders/sales/emails showed `250 / Powder gm` or no unit; cart/wishlist API had no unit; `orders:fix-variant-labels` command for old items
- [x] Storefront forgot/reset password: `POST /api/forgot-password`, `/api/reset-password` (were missing → 404); customer reset links open the storefront
- [x] Affiliate referral program: `/api/affiliate/apply`, `/apply-me`, `/status`, `/click`; `ref` on register/orders; admin approve/block/per-affiliate commission; fixed Rs per delivered order; dashboard crash (`products.sale_price`) fixed; storefront referral links
- [x] WhatsApp webhook: missing `Http` import (media messages crashed), all messages per batch, dedupe by wamid, more message types, media to `public/storage/whatsapp`, always 200

### 2026-10-01 — QA batch
- [x] Product reviews publish instantly with `is_verified` (bought the product); homepage reviews carry title, verified flag, photos
- [x] Price filter/sort used a missing `products.price` column (500) — now the card price (cheapest active variant)
- [x] Empty categories hidden on the storefront; misspelt 'Spiecs' retired; owner-set category display order (`categories.sort_order`)
- [x] "Did you mean" search suggestions (`SearchSuggestionService`); `GET /api/slugs` + reserved page slugs; `other_name` / `alternative_name` in the API
- [x] Customer's last delivery address remembered; sale invoice shows the delivery address; size labels with unit
- [x] WhatsApp: rejected sends count as failures, one Graph API version, tests never call Meta

### 2026-10-02 … 10-09
- [x] `backfill:other-names` fills `other_name` from the old-site overview (never overwrites admin values)
- [x] Admin notification bell polls every 20 s with sound; super-admin + admin; bell for incoming WhatsApp messages
- [x] Custom items on orders and sales (no `product_id`, never touch stock)
- [x] **No free shipping on any amount** (owner, 2026-10-07): always the city rate, default 250
- [x] `GET /api/header` — admin marquee text (UI Settings → Homepage), cached 5 min
- [x] Categories Dry Fruits, Herbal Tea, Combo Deals, Honey; `CategorySeeder` holds all 14 with order + image
- [x] Orders moved to Sales leave the orders list (toggle to show); sales date range (today by default) for list + stat cards
- [x] Invoice: size/variant pill, address no longer a Gmail Maps link
- [x] `products_clean.json` rebuilt from the new-site export: 557 active products (31 new incl. Murrabajat, Arqiyaat)
- [x] Migrations folded to one per table (107 → 88 files incl. later ones); fresh migrate gives the identical schema
- [x] Roman Urdu comments/messages rewritten in English

### 2026-10-10
- [x] Customer sees "Processing" once a sale is made from the order
- [x] Courier booking: Leopards/PostEx/Movex cities looked up by name from the courier's own list (9 of 10 Leopards ids were wrong); every attempt saved in `courier_bookings`; Book / Retry on the sale page; never books twice
- [x] Orders list: Status / Payment / City filters; bulk status for ticked orders (normal status rules + events); stat cards match the list; table refresh keeps current filters
- [x] Returns (`OrderReturnService`): completed requests restock + take back points proportionally; "Returned" order/sale restocks everything, takes back earned points, gives back spent points, reverses affiliate commission. `returns` eligibility on `GET /api/orders[/{id}]`
- [x] **1 reward point = Rs 1** (owner); earning stays 1 point per Rs 100; data migration moves old 0.02 rate
- [x] `ProductBlogSeeder`: 10 new long-form SEO posts + BlogSeeder's 4 stubs rewritten; product image thumbnails copied to `storage/blogs`; 27 tags; new category Hair Care

---

## PENDING

### P0
- [ ] WhatsApp OTP for account claim / first login (default password = phone is insecure)
- [ ] Production deploy of 2026-09-29 → 10-10 work (see checklist) incl. `WHATSAPP_APP_SECRET`
- [ ] Run `ProductBlogSeeder` on production (14 blog posts) — `sufyan` branch, not merged to `master`
- [ ] Set affiliate default commission (Admin → Affiliate Settings, Rs per order)

### P1
- [ ] Confirm meaning of `product_variants.price` (cost vs selling) and make `OrderRepository` cost price consistent
- [x] Revoke Sanctum tokens when a user is deactivated (`User::booted`, 2026-09-30)
- [x] Loyalty redemption: `POST /api/rewards/redeem` (quote) + `redeem_points` on `POST /api/orders` and `/checkout/quote`, 50 pts = Rs 1, refunded on cancel (2026-09-30)
- [x] Loyalty + commission reversal and restock on returns (`OrderReturnService`, 2026-10-10)
- [ ] Money refund for returns is still manual (no wallet credit / payout)
- [x] Stale comment in `RewardsApiController` ("50 at the default rate") fixed (2026-10-10)
- [ ] Manjistha product merge (owner decision)

### P2
- [x] `BackfillPowderAdditional` matched 0 rows on MySQL — now filters in PHP (2026-09-30)
- [ ] Merge duplicate `PointTransaction` / `LoyaltyPointTransaction` models
- [ ] `PageController` (Pages CMS) has no routes — finish or remove
- [ ] `tsc --noEmit` pre-existing admin panel TypeScript errors
- [ ] CSP `script-src 'none'` for `/storage/*.svg`
- [ ] VPS move + async queue (owner decision)

---

## Before Production Deploy — Checklist

1. **Backup the production DB.**
2. Make sure production runs **PHP 8.4** and `APP_ENV=production`, `APP_DEBUG=false`.
3. Set new env vars: `WHATSAPP_APP_SECRET` (Meta App → Settings → Basic).
4. Run migrations:
   ```bash
   php artisan migrate --force
   ```
   New since 2026-09-29: `orders.coupon_code`, `orders.delivered_at`, `order_items.deal_id`, `affiliates.fixed_commission`, `whatsapp_messages.wa_message_id/contact_name/type`, `categories.sort_order`, `courier_bookings` table, data migrations (retire 'Spiecs', category order, new categories, loyalty rate 1 point = Rs 1).
   Migrations were folded to one per table on 2026-10-07 — on a database that already ran the old files, check `migrate:status` first; live was meant to be deployed fresh.
5. Idempotent seeders (only if roles/permissions changed):
   ```bash
   php artisan db:seed --class=RolePermissionSeeder --force
   ```
   (`AdminSeeder` skips itself in production.)
6. Verify zero empty-variant rows (expected 0):
   ```sql
   SELECT sku, attributes, value FROM product_variants
   WHERE deleted_at IS NULL
     AND ((attributes IS NULL OR attributes IN ('[]','{}',''))
       OR (value IS NULL OR TRIM(value) = '' OR value = '[]'));
   ```
   If rows appear: `php artisan backfill:flat-variant-attributes`.
7. Verify grand_total integrity (expected 0 rows):
   ```sql
   SELECT id, order_number FROM orders
   WHERE deleted_at IS NULL
     AND ABS(grand_total - (subtotal - invoice_discount + shipping_charges + tax)) > 0.01;
   ```
8. Clear caches: `php artisan optimize:clear`.
   Then fix old order/sale item labels: `php artisan orders:fix-variant-labels --dry-run`, check the sample, run without `--dry-run`.
   Fill other names: `php artisan backfill:other-names --dry-run`, then without `--dry-run`.
   Blog posts: `php artisan db:seed --class=ProductBlogSeeder --force` (skips existing posts).
9. Admin: set Affiliate Settings (default commission, min payout, cookie days); attach products to active deals.
