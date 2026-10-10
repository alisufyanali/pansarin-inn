# Project Memory — Pansari Inn (backend)

## Context

- **Owner / dev**: single developer; prompts Claude (Claude Code desktop / Cursor)
- **Language**: Hinglish (Roman Urdu + English), concise answers
- **Workflow**: diagnose from code → targeted fix → Pest test → verify → commit per fix → update these docs
- **Branch**: work happens on `sufyan`; `master` is the main branch
- **Frontend repo**: `D:\laragon\www\pansariinn.com` (docs in its `docs/project/`; default branch `main`)

---

## Key Decisions (and why)

| Decision | Rationale |
|---|---|
| Prices only on `product_variants` (`sale_price ?? price` + `additional`) | Products table has no price columns; variants always carried the real price |
| Phone canonical = `923XXXXXXXXX` via `PhoneHelper::normalize()` | One format for users.username, customers.phone, order snapshots and WhatsApp |
| Server-side checkout pricing (`CheckoutPricingService`) + `/api/checkout/quote` | Client-sent prices/discounts were trusted (Rs 1 orders possible). Quote endpoint lets the storefront show exactly what the server will charge |
| Deals applied as order line discounts; storefront may send deal price | Keeps catalogue price + discount visible in order/sale items and reports; backwards compatible with either price the storefront sends |
| Deal defaults: % / fixed / flash per unit, Buy X Get Y on the same line, bundle only with all products | Chosen 2026-09-29 when the owner picked "Option B" without specifying — can be revisited |
| Affiliates are **referral-only**, commission = fixed Rs per delivered order | Owner decision 2026-09-30; delivery/stock by Pansari Inn; affiliate panel in Laravel `/affiliate` |
| First referral wins (`users.referred_by` never overwritten); guest orders attach only for new accounts | Prevents affiliates claiming existing customers by typing their phone |
| `/admin` gated by `staff` middleware | Seeder gives `customer` role `view.orders` etc. — permission alone exposed all orders to customers |
| `/api/register` refuses existing phones | It used to return a token and overwrite the password of any account by phone |
| Stock taken at order placement; restore is net-based | Delivery used to deduct a second time; cancel/return never restocked |
| Sale delivery mirrors onto Order | Points, affiliate commission and return window listen to the Order |
| Native `$file->move()` + `SafeImage` for uploads | Production lacks `fileinfo` |
| `QUEUE_CONNECTION=sync` | Shared hosting, no worker; mail/WhatsApp failures wrapped in try/catch |
| Order numbers from 50001 | Continue legacy CodeIgniter numbering |
| No free shipping on any amount (2026-10-07) | Owner: always the city rate, default 250 (`CheckoutPricingService::DEFAULT_SHIPPING`, same as storefront `lib/cities.ts`) |
| 1 reward point = Rs 1 (2026-10-10) | Owner; earning stays 1 point per Rs 100 (`loyalty_points_per_rupee` 0.01) |
| Returns reverse points + commission automatically, money refund stays manual | `OrderReturnService`, idempotent, balances never below zero; guest orders cannot be returned online |
| Courier cities looked up by name in the courier's own list | Hard-coded Leopards ids were wrong (Islamabad went as Gwadar); an unknown city stops the booking instead of sending it elsewhere |
| One migration per table (2026-10-07) | Schema readable in one place; live is deployed fresh |
| Blog seed posts copy the product image to `storage/blogs/` | Deleting a blog deletes its thumbnail file — a shared product image would be lost |

---

## Known Gotchas

- **PHP version**: `composer.lock` needs PHP ≥ 8.4; Laragon default CLI is 8.2 → use `D:\laragon\bin\php\php-8.4\php.exe` for artisan/tests.
- **Default password = phone** for auto-created and imported accounts (`must_change_password=true`). Anyone who knows the phone can log in until it is changed — WhatsApp OTP still pending.
- **`product_variants.price` meaning is inconsistent**: `OrderRepository` stores it as cost price, cart/API treat `sale_price ?? price` as the selling price. Confirm with owner before building margin reports.
- **Duplicate models** `PointTransaction` and `LoyaltyPointTransaction` both map to `point_transactions`.
- **`customers.user_id` can be null** for legacy imports — normal.
- **`$this->attributes` in Eloquent** is the internal attribute bag, not the `attributes` JSON column — use `getAttribute('attributes')` inside accessors.
- **Two auth systems**: storefront customers → Sanctum (`/api/login`); admin/affiliate → Fortify session (`/login`).
- **Affiliate wallet** is kept equal to `affiliates.balance` by `Affiliate::updated` (increment/decrement fire it).
- **Laravel numeric throttles share one bucket per IP** (`throttle:5,1` on two routes counts together) → use named limiters.
- **Deactivating a user** (`status=0`) blocks logins and deletes their Sanctum tokens (`User::booted`). There is no admin UI toggle for `users.status` yet.
- **Raw `json_extract()`** returns quoted values on MySQL but bare values on SQLite — compare JSON attributes in PHP or with Laravel `->` paths.
- **routes/test.php** is only registered when `APP_ENV=local` — production `.env` must say `production`.
- **Notifications are database-only** — no broadcaster is configured (`BROADCAST_DRIVER` is ignored by Laravel 11+); the admin bell polls `/admin/notifications/unread` every 20 s.
- **Blog API caps `per_page` at 50**; `blogs.meta_title` is `varchar(60)`.
- **Custom order items** have `product_id = null` — anything that walks order items for stock, products or reports must skip them.

---

## Data Notes

- Seeded demo orders used 5% tax; production API sets tax 0.
- Legacy customers imported from `database/seeders/data/customers.json` via `php artisan customers:import` (`CustomerLegacyImportService`); ID map in `storage/app/legacy_customer_id_map.json`.
- Local DB has 3 seeded deals without products — they are hidden by `/api/deals`.

---

## Open Decisions

- [ ] WhatsApp OTP for account claim / first login
- [ ] Meaning of `product_variants.price` (cost vs selling)
- [ ] Manjistha duplicate product merge
- [ ] VPS move (async queue, cron)
- [x] Loyalty redemption — spent at checkout (2026-09-30); 1 point = Rs 1 since 2026-10-10; customer wallet spending still open
- [x] Homepage "Combo Deals" — `/api/homepage` now returns `combo_deals` (admin deals, bundles first); storefront must switch from static data

---

## Session Log

| Date | Summary |
|---|---|
| 2026-09-03 | Knowledge base created from codebase scan |
| 2026-09-21 | OldProductsImportSeeder handles flat `{label/value}` JSON |
| 2026-09-28 | Legacy import hardening, SafeImage rule, blog public count endpoints, rewards wallet_balance |
| 2026-09-29 | Security/logic audit + fixes: register takeover, server pricing + coupons, staff gate + permissions, stock double-deduction / restock, sale→order sync + return window, affiliate payout lock, profile phone sync, webhook signature, per_page/sort, login status, rate limits |
| 2026-09-29 | Product Deals wired end-to-end (DealPricingService, CheckoutPricingService, /api/deals, /api/checkout/quote, admin toggle/duplicate/edit fix) |
| 2026-09-30 | Affiliate referral program (apply → approve → ref tracking → fixed commission); WhatsApp webhook reliability fix (missing Http import, batches, dedupe, media); docs refreshed from code |
| 2026-09-30 | Homepage `combo_deals` from admin deals (`/api/deals?type=`), loyalty redemption at checkout (50 pts = Rs 1) |
| 2026-10-02…09 | Other-names backfill; live notification bell; custom order items; no free shipping; `/api/header`; 4 new categories + CategorySeeder with all 14; orders→sales list split, sales date range; product data rebuilt (557); migrations one per table; English-only messages |
| 2026-10-10 | Courier city lookup + `courier_bookings`; order filters + bulk status; returns reverse points/commission (`OrderReturnService`); 1 point = Rs 1; `ProductBlogSeeder` (14 SEO posts). Docs refreshed from code — 254 tests passing |
| 2026-10-01 | QA batch: reviews publish instantly with is_verified; price filter/sort by card price (was 500); homepage review title/verified/photos; empty categories hidden + Spiecs retired; search suggestions; GET /api/slugs + reserved product slugs; other/alternative names in API; PKR wording |
