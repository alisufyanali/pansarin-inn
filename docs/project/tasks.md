# Tasks & Progress — Pansari Inn (backend)

> Last updated: 2026-09-30. Test suite: 170 passing (`php-8.4 vendor/bin/pest`).

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
- [x] Storefront forgot/reset password: `POST /api/forgot-password`, `/api/reset-password` (were missing → 404); customer reset links open the storefront
- [x] Affiliate referral program: `/api/affiliate/apply`, `/apply-me`, `/status`, `/click`; `ref` on register/orders; admin approve/block/per-affiliate commission; fixed Rs per delivered order; dashboard crash (`products.sale_price`) fixed; storefront referral links
- [x] WhatsApp webhook: missing `Http` import (media messages crashed), all messages per batch, dedupe by wamid, more message types, media to `public/storage/whatsapp`, always 200

---

## PENDING

### P0
- [ ] WhatsApp OTP for account claim / first login (default password = phone is insecure)
- [ ] Production deploy of 2026-09-29/30 work (see checklist) incl. `WHATSAPP_APP_SECRET`
- [ ] Set affiliate default commission (Admin → Affiliate Settings, Rs per order)

### P1
- [ ] Confirm meaning of `product_variants.price` (cost vs selling) and make `OrderRepository` cost price consistent
- [ ] Revoke Sanctum tokens when a user is deactivated
- [ ] Loyalty redemption endpoint (`POST /rewards/redeem`) — storefront rewards page waits for it
- [ ] Automatic refund / loyalty reversal on completed returns (currently manual)
- [ ] Manjistha product merge (owner decision)

### P2
- [ ] `BackfillPowderAdditional`: use `JSON_UNQUOTE` / `where('attributes->Form', ...)` (matches 0 rows on MySQL)
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
   New since 2026-09-29: `orders.coupon_code`, `orders.delivered_at`, `order_items.deal_id`, `affiliates.fixed_commission`, `whatsapp_messages.wa_message_id/contact_name/type`.
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
9. Admin: set Affiliate Settings (default commission, min payout, cookie days); attach products to active deals.
