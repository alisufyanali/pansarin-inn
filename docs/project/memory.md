# Project Memory — Pansari Inn (backend)

## Context

- **Owner / dev**: single developer; prompts Claude (Claude Code desktop / Cursor)
- **Language**: Hinglish (Roman Urdu + English), concise answers
- **Workflow**: diagnose from code → targeted fix → Pest test → verify → commit per fix → update these docs
- **Branch**: work happens on `sufyan`; `master` is the main branch
- **Frontend repo**: `D:\laragon\www\Pansarii-Frontend` (docs in its `docs/project/`)

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
- [ ] Loyalty redemption + customer wallet spending
- [ ] Homepage "Combo Deals" section on the storefront still uses static data

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
