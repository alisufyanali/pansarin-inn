# Architecture — Pansari Inn (backend)

> Last verified against code: 2026-09-30.

## Stack

| Layer | Technology | Version (source) |
|---|---|---|
| Backend framework | Laravel | ^12.0 (`composer.json`) — installed 12.53 |
| PHP | PHP | `composer.json` says `^8.2`, but `composer.lock` needs **>= 8.4** (Laragon CLI 8.2 fails `platform_check`; use `D:\laragon\bin\php\php-8.4\php.exe`) |
| Admin UI | Inertia.js + React | inertia-laravel ^2.0, @inertiajs/react ^2.2, React ^19.2 |
| Storefront | Next.js (separate repo `Pansarii-Frontend`) | see that repo's docs |
| Auth | Sanctum (customer API tokens) + Fortify (admin/affiliate web login) | Sanctum ^4.2, Fortify ^1.30 |
| Roles/Permissions | Spatie Laravel Permission | ^6.23 |
| Queue | `QUEUE_CONNECTION=sync` in production | jobs run inside the request |
| Real-time | Reverb/Pusher packages installed; only `OrderShipped` notification broadcasts | no `config/broadcasting.php` published |
| Build / CSS | Vite ^7, Tailwind CSS ^4, TypeScript ^5.9 | `package.json` |
| Other | Telescope ^5.17 (gate empty in non-local), dompdf, PhpSpreadsheet, Spatie MediaLibrary, Ziggy, Wayfinder | `composer.json` |
| Tests | Pest 4 on SQLite `:memory:` | 32 test files, 170 tests passing (2026-09-30) |

---

## Domains

| Domain | Purpose |
|---|---|
| `pansariinn.com` | Customer storefront (Next.js, Vercel) — `FRONTEND_URL` |
| `https://pansarii-frontend.vercel.app` | Vercel preview — `FRONTEND_URL_2` |
| `custom.pansariinn.pk` | Laravel backend: `/api/*`, admin `/admin/*`, affiliate `/affiliate/*`, WhatsApp webhook |
| `pansariinn.pk` | Legacy CodeIgniter site (being retired) |

---

## Folder Structure

```
pansarin-inn/
├── app/
│   ├── Console/Commands/     BackfillFlatVariantAttributes, BackfillPowderAdditional,
│   │                         CustomersImportCommand (customers:import), CustomersImportRescueCommand
│   ├── Events/ Listeners/    LowStockAlert → SendLowStockNotification
│   ├── Helpers/              PhoneHelper, SequenceGenerator
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/        40 files (incl. Admin/Affiliate/PayoutController, Admin/Settings/*)
│   │   │   ├── API/          23 customer/storefront API controllers
│   │   │   ├── Affiliate/    Affiliate dashboard, catalogue, payouts (role:affiliate)
│   │   │   └── Settings/     Account settings (profile, password, 2FA)
│   │   ├── Middleware/       EnsurePasswordChanged, EnsureStaff, HandleAppearance,
│   │   │                     HandleInertiaRequests, SecurityHeaders, TrackAffiliate
│   │   ├── Repositories/Admin/  29 repositories
│   │   └── Requests/Admin/   FormRequests for admin writes
│   ├── Jobs/                 Order/Sale email + WhatsApp jobs, bulk WhatsApp
│   ├── Mail/  Notifications/ Mailables; database notifications for the admin bell
│   ├── Models/               75 models
│   ├── Observers/            OrderObserver (loyalty points on delivery)
│   ├── Rules/                SafeImage (upload validation without fileinfo)
│   ├── Services/             AffiliateService, CheckoutPricingService, CourierService,
│   │                         CustomerIdentityService, CustomerLegacyImportService,
│   │                         DealPricingService, WhatsAppService
│   └── Support/              OrderMailRecipient, SortInput
├── bootstrap/app.php         Middleware aliases (password.changed, staff) + API exception shield
├── database/migrations/      102 files
├── resources/js/pages/       Admin/*, Affiliate/*, auth, settings (Inertia)
├── resources/views/          mail-layout component + emails/*
└── routes/
    ├── api.php               Storefront API
    ├── admin.php             /admin/* (auth, verified, staff)
    ├── affiliate.php         /affiliate/* (role:affiliate) + /admin/affiliate* (role:admin)
    ├── frontend.php          /admin/settings/{ui,general,business}/* (+ 3 demo FrontendController routes)
    ├── settings.php          /settings/* account pages
    ├── web.php               home, privacy, WhatsApp webhook, maintenance routes; requires the others
    └── test.php              seeder/test routes — registered only when APP_ENV=local
```

---

## Request Flow

```
Customer → Next.js (pansariinn.com) → /api/* (Laravel) → Controller → Service/Repository → MySQL
Admin/Affiliate → /login (Fortify) → /admin/* or /affiliate/* → Inertia React pages
Meta WhatsApp → POST /whatsapp/webhook (signature-checked) → whatsapp_messages
```

---

## API Route Map (`routes/api.php`)

### Auth — `throttle:10,1`
| Method | Path | Notes |
|---|---|---|
| POST | /api/login | Phone + password only (`login` or `phone` field, normalized). Per `phone|IP` 5 tries → 60 s lock. Deactivated users (`users.status=0`) → 403 |
| POST | /api/register | New phone only — an existing phone returns 422 (never issues a token for another account). Accepts `ref` (affiliate code) |

### Password reset — `throttle:api.password-reset` (5/min per email; requests come via the Next.js server IP)
| Method | Path | Notes |
|---|---|---|
| POST | /api/forgot-password | `{email}` → sends Laravel reset link; same 200 answer whether or not the email exists |
| POST | /api/reset-password | `{token, email, password, password_confirmation}` → resets, clears `must_change_password`, deletes all Sanctum tokens; bad/expired token → 422 |

Reset link (`ResetPassword::createUrlUsing` in `AppServiceProvider`): customers → `{FRONTEND_URL}/reset-password?token=&email=`; staff/affiliates → Fortify `/reset-password/{token}`. Only accounts with an email can reset this way.

### Public — `throttle:api.public` (60/min per IP; 1000/min with valid `X-Build-Token`)
| Method | Path | Extra limiter / notes |
|---|---|---|
| GET | /api/products, /products/featured, /with-video, /recommended, /{slug}, /{slug}/related | products carry `deal` + `deal_price` (+ variant `deal_price`) |
| POST | /api/products/check-stock | |
| GET | /api/categories, /cities, /health-concerns | |
| GET/POST | /api/products/{slug}/reviews | POST: `api.reviews` (5/min) + 1 guest review/product/IP/day |
| POST | /api/reviews/{id}/helpful | 1 vote per IP per review (30 days) |
| GET | /api/homepage, /homepage/category-products, /homepage/reviews, /slides | |
| GET/POST | /api/reviews | site reviews; POST `api.reviews` |
| GET | /api/blog-categories, /blog-tags, /blogs, /blogs/{slug} | |
| GET | /api/offers | active **coupons** |
| GET | /api/deals, /deals/{slug} | active admin **Product Deals** with products |
| POST | /api/contact, /newsletter/subscribe | `api.forms` (5/min) |
| POST | /api/coupons/validate | `api.coupons` (20/min); optional `items[]` for product/category coupons |
| GET | /api/orders/track | `orders.track` (10/min); order_number + phone |
| POST | /api/orders/guest | `api.guest-orders` (10/min); accepts `coupon_code`, `ref` |
| POST | /api/checkout/quote | server-priced totals (deals, coupon, shipping) |
| POST | /api/affiliate/apply | `api.forms`; creates account + pending application |
| POST | /api/affiliate/click | validates `ref`, records click, returns `cookie_days` |

### Protected — `auth:sanctum`, `throttle:60,1`, `password.changed`
| Method | Path |
|---|---|
| POST | /api/logout (`api.logout`), POST /api/change-password (`password.change`) |
| GET | /api/user; PUT /api/profile (phone change moves username + customer phone) |
| GET/POST/PATCH/DELETE | /api/cart[/{id}] (items include `deal_price`, `deal`) |
| GET/POST | /api/orders; GET /api/orders/{id}; PATCH /api/orders/{id}/cancel |
| GET/POST/DELETE | /api/wishlist[/{id}] |
| POST/GET | /api/affiliate/apply-me, /api/affiliate/status |
| GET | /api/rewards; GET/POST /api/returns; GET/POST /api/support; notifications (index, `{id}/read`, read-all) |

`per_page` is clamped everywhere (1–50; products 1–100).

---

## Web / Admin Routes

- `/admin/*` (`routes/admin.php`): `auth`, `verified`, **`staff`**. `EnsureStaff` rejects users whose only roles are `customer`/`affiliate` (affiliates are redirected to `/affiliate/dashboard`). Each controller also checks Spatie permissions per action.
- `/admin/settings/*` (`routes/frontend.php`): `auth, verified, staff, permission:{view|edit}.settings`.
- `/affiliate/*`: `auth, role:affiliate` — dashboard, product catalogue, referral details, payouts.
- `/admin/affiliates*`, `/admin/affiliate/{id}/{approve|block|commission}`, payouts, settings: `auth, verified, role:admin`.
- Maintenance routes (`/clear-cache`, `/run-build-clear`, …): `auth, staff, permission:run-maintenance`.
- `GET|POST /whatsapp/webhook`: public, `throttle:30,1`, CSRF-exempt.
- Post-login redirect (`FortifyServiceProvider::homeFor`): staff → `/admin/dashboard`, affiliate → `/affiliate/dashboard`, others → `/`.

---

## DB Schema Summary (key tables)

| Table | Notes |
|---|---|
| `users` | `username` = normalized phone for customers (`923XXXXXXXXX`); `status` (0 = cannot log in); `must_change_password`; `referred_by` → affiliate's user id |
| `customers` | `phone` UNIQUE (normalized), `user_id` nullable for legacy imports |
| `products` | **no price columns** — prices live on variants |
| `product_variants` | `price`, `sale_price`, `additional` (surcharge), `attributes` JSON, `status` |
| `product_stocks` / `inventories` | stock level / movement log; Inventory model events keep `product_stocks` in sync |
| `orders` | `order_number` UNIQUE (`ORDER-{seq}`), `coupon_code`, `delivered_at`, customer snapshots |
| `order_items` | `deal_id` (nullable), `discount` (deal line discount), `meta` (names, sku, cost, deal_title, deal_units) |
| `sales` / `sale_items` | fulfilment records; `sales.order_id` links to the order |
| `coupons` | `usage_count`, `usage_limit`, `per_user_limit`, `apply_to` (order/product/category) |
| `deals` / `deal_product` | admin Product Deals; pivot `custom_discount`, `stock_limit`, `sold_count` |
| `affiliates` | `status` pending/active/blocked, `fixed_commission` (Rs/order, null = default), `balance` |
| `affiliate_commissions` | one row per order (`UNIQUE(affiliate_id, order_id)`) |
| `affiliate_clicks`, `affiliate_settings` (`default_commission`, `min_payout`, `cookie_duration`), `payout_requests`, `payment_methods` | |
| `wallets` / `wallet_transactions` | polymorphic (Customer, Affiliate); affiliate wallet mirrors `affiliates.balance` |
| `loyalty_points`, `point_transactions` | both `PointTransaction` and `LoyaltyPointTransaction` models map to `point_transactions` |
| `return_requests`, `return_request_items` | |
| `whatsapp_messages` | `wa_message_id` UNIQUE, `contact_name`, `type`, `media_url` |
| `whatsapp_message_logs` | outgoing messages |
| `sequences` | order/sale numbering (starts 50000) |

---

## Key Patterns

### Checkout pricing (server is the source of truth)
`CheckoutPricingService::price()` is used by `POST /orders`, `/orders/guest` and `/checkout/quote`:
1. Item price must be ≥ the variant base price (`sale_price ?? price`); capped at `final_price` (+ `additional`). A lower price is accepted only if a deal explains it.
2. `DealPricingService::applyToLines()` turns active deals into line discounts (percentage/flash_sale/fixed per unit, buy_x_get_y free units, bundle when all products present; honours window, `max_uses`, `min_purchase_amount`, `stock_limit`).
3. Coupon recomputed from `coupon_code` (client `invoice_discount` ignored).
4. Shipping: city rate, default 250, free above 5000 (post-deal subtotal).
`OrderRepository::store()` then locks stock rows, redeems the coupon and deals (`usage_count`, `per_user_limit`, `current_uses`, `max_uses_per_user`, `sold_count`) inside the transaction.

### Stock
- Stock is deducted when the order is placed (Inventory `out`, reference = order_number). `Order::reduceStock()` on delivery only fills in for orders without that entry.
- Cancelling an order (`Order::booted`) → `restoreStock()` (net-based, idempotent), `releaseCoupon()`, `releaseDeals()`.
- Completing a return request restocks returned quantities once (`RETURN-{id}` reference).
- Low-stock alert fires only when stock crosses the threshold (10).

### Order ↔ Sale
A Sale linked to an order mirrors `delivered` / `cancelled` onto the Order (`Sale::syncOrderStatus`), which triggers loyalty points (`OrderObserver`), affiliate commission and stock hooks. Return window = 7 days from `sale.delivery_datetime ?? orders.delivered_at`.

### Affiliate (referral) program
Storefront keeps `?ref=CODE` and sends it with register/orders → `AffiliateService::attachReferral()` sets `users.referred_by` (first referral only; guest orders only for newly created accounts). On delivery, the referring **active** affiliate earns a fixed amount per order (`Affiliate::commissionPerOrder()`), once per order.

### Customer identity
`CustomerIdentityService::findOrCreateByPhone()` is the single path for creating User + Customer from a phone (new accounts get password = phone and `must_change_password=true`).

### HasTotals
`grand_total = subtotal − invoice_discount + shipping_charges + extra` (Order: `tax`, Sale: `vat`); item `subtotal = price×qty − discount`, so `product_discount` is never subtracted again.

### Rate limiters (`AppServiceProvider`)
`api.public`, `orders.track`, `api.forms` (5), `api.reviews` (5), `api.coupons` (20), `api.guest-orders` (10) — named limiters so buckets don't collide.

### Exception shield (`bootstrap/app.php`)
Unhandled Throwable on `api/*` / JSON → logged, generic 500 JSON. Validation/Auth/404/HttpException pass through.

### WhatsApp webhook
`WhatsAppController@webhook`: GET verify (constant-time token compare, plain-text challenge); POST requires valid `X-Hub-Signature-256` when `WHATSAPP_APP_SECRET` is set, stores every message in a batch, dedupes by wamid, downloads media to `public/storage/whatsapp`, always answers 200.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL` | Laravel basics (`APP_ENV=production`, `APP_DEBUG=false` in prod) |
| `FRONTEND_URL`, `FRONTEND_URL_2` | Storefront URLs — CORS, email links, affiliate referral links |
| `BUILD_API_TOKEN` | `X-Build-Token` rate-limit bypass for `next build` |
| `DB_*` | MySQL connection |
| `MAIL_*`, `ADMIN_EMAIL` | Mail driver / admin notification recipient |
| `SANCTUM_EXPIRATION` | API token lifetime in minutes (default 10080 = 7 days); `sanctum:prune-expired` runs daily |
| `QUEUE_CONNECTION`, `SESSION_DRIVER`, `CACHE_STORE`, `LOG_*` | Infra |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_API_URL`, `WHATSAPP_PHONE_NUMBER` | WhatsApp Cloud API + webhook |
| `MOVEX_API_TOKEN`, `POSTEX_API_TOKEN`, `LEOPARD_*` | Courier integrations |
| `PUSHER_*` / `REVERB_*` | Broadcasting (mostly unused) |

---

## Deployment Constraints

- Shared Hostinger hosting: no supervisor/queue worker; `QUEUE_CONNECTION=sync`.
- PHP `fileinfo` missing in production → uploads use `SafeImage` rule + native `$file->move()` to `public/storage/...`.
- Production PHP must be 8.4 (lock file).
- Run `php artisan migrate --force` after every deploy that adds migrations.
