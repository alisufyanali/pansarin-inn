# Architecture — Pansari Inn

## Stack

| Layer | Technology | Version |
|---|---|---|
| Backend framework | Laravel | 12.x |
| PHP | PHP | ^8.2 |
| Admin UI | Inertia.js + React | Inertia 2.2.x, React 19.x |
| Storefront | Next.js (separate repo) | TODO: confirm version |
| Storefront hosting | Vercel | — |
| Backend hosting | Shared hosting (Hostinger) | No root access |
| Database | MySQL (production) | TODO: confirm version |
| Auth | Laravel Sanctum (API) + Fortify (admin web) | Sanctum 4.x, Fortify 1.x |
| Roles/Permissions | Spatie Laravel Permission | 6.x |
| Queue | Sync (production) — `QUEUE_CONNECTION=sync` | — |
| Real-time | Pusher / Laravel Echo / Reverb | TODO: confirm active driver |
| Build tool | Vite 7.x | — |
| CSS | Tailwind CSS 4.x | — |
| Component lib | Radix UI + Headless UI | — |

---

## Domains

| Domain | Purpose | Status |
|---|---|---|
| `pansariinn.com` | Customer storefront (Next.js) | Active |
| `pansariinn.pk` | Legacy CodeIgniter site | Being retired; 308 redirects in place |
| `custom.pansariinn.pk` (TODO: confirm) | Laravel backend / admin | `APP_URL` in .env |

---

## Folder Structure

```
pansarin-inn/
├── app/
│   ├── Console/Commands/          — 2 artisan commands (backfill:flat-variant-attributes, backfill:powder-additional)
│   ├── Events/                    — LowStockAlert
│   ├── Helpers/                   — PhoneHelper.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/             — Admin panel controllers (~35 files)
│   │   │   ├── API/               — Customer API controllers (~20 files)
│   │   │   └── Settings/          — Settings controllers
│   │   ├── Middleware/            — HandleInertiaRequests, SecurityHeaders, EnsurePasswordChanged, TrackAffiliate
│   │   ├── Repositories/Admin/    — 29 repository files (one per domain)
│   │   └── Requests/Admin/        — FormRequest validation classes
│   ├── Jobs/                      — Queued jobs (email, WhatsApp notifications)
│   ├── Mail/                      — Mailable classes
│   ├── Models/                    — Eloquent models
│   ├── Notifications/             — Laravel notification classes
│   ├── Observers/                 — OrderObserver
│   ├── Providers/                 — AppServiceProvider, FortifyServiceProvider, etc.
│   └── Services/                  — AffiliateService, CourierService, WhatsAppService
├── bootstrap/app.php              — Middleware config + exception shield
├── config/
│   └── app.php                    — Includes frontend_url + build_api_token keys
├── database/
│   ├── migrations/                — 90+ migration files
│   └── seeders/                   — Full seeder suite (incl. CustomerImportSeeder)
├── docs/project/                  — This knowledge base
├── resources/
│   ├── js/                        — React/Inertia admin panel
│   │   ├── components/            — Shared UI components
│   │   ├── layouts/               — app-layout.tsx, auth-layout.tsx
│   │   └── pages/Admin/           — Page components per module
│   └── views/
│       ├── components/mail-layout.blade.php
│       └── emails/                — Blade email templates
├── routes/
│   ├── api.php                    — Customer API routes
│   ├── admin.php                  — Admin panel routes
│   ├── web.php                    — Public web + loads admin/affiliate/settings/test
│   ├── affiliate.php              — Affiliate-specific routes
│   ├── frontend.php               — Admin settings UI routes (misnamed): /admin/settings/ui/*, /admin/settings/general/*, /admin/settings/business/*; also two legacy FrontendController stubs
│   └── settings.php               — User account settings routes: /settings/profile, /settings/password (throttle:6,1), /settings/appearance, /settings/two-factor — middleware: auth
└── storage/app/legacy_customer_id_map.json  — Legacy CI customer ID → new ID mapping
```

---

## Request Flow

```
Customer browser
    → Next.js (Vercel, pansariinn.com)
        → GET /api/* (Laravel, pansariinn.pk backend)
            → routes/api.php → API Controller → Repository/Service → DB (MySQL)
            ← JSON {success, message?, data?}
        ← Rendered page

Admin browser
    → GET /admin/* (Laravel)
        → routes/admin.php → Admin Controller → Repository → DB
        ← Inertia page (React component, server-side rendered props)
```

---

## API Route Map

### Auth (throttle:10,1)
| Method | Path | Controller | Auth |
|---|---|---|---|
| POST | /api/login | AuthApiController@login | Public |
| POST | /api/register | AuthApiController@register | Public |

### Public (throttle:api.public — 60/min or 1000/min with X-Build-Token)
| Method | Path | Controller |
|---|---|---|
| GET | /api/products | ProductApiController@index |
| GET | /api/products/{slug} | ProductApiController@show |
| GET | /api/products/featured | ProductApiController@featured |
| GET | /api/products/with-video | ProductApiController@withVideo |
| GET | /api/products/recommended | ProductApiController@recommended |
| POST | /api/products/check-stock | ProductApiController@checkStock |
| GET | /api/products/{slug}/related | ProductApiController@related |
| GET | /api/categories | ProductApiController@categories |
| GET | /api/cities | CityApiController@index |
| GET | /api/health-concerns | HealthConcernApiController@index |
| GET | /api/products/{slug}/reviews | ProductReviewApiController@index |
| POST | /api/products/{slug}/reviews | ProductReviewApiController@store |
| POST | /api/reviews/{id}/helpful | ProductReviewApiController@helpful |
| GET | /api/homepage | HomepageApiController@index |
| GET | /api/homepage/category-products | ProductApiController@homepageCategoryProducts |
| GET | /api/homepage/reviews | HomepageApiController@reviews |
| GET | /api/slides | HomepageApiController@slides |
| GET | /api/reviews | SiteReviewApiController@index |
| POST | /api/reviews | SiteReviewApiController@store |
| GET | /api/blogs | BlogApiController@index |
| GET | /api/blogs/{slug} | BlogApiController@show |
| GET | /api/offers | OffersApiController@index |
| POST | /api/contact | ContactApiController@store |
| POST | /api/coupons/validate | CouponApiController@check |
| POST | /api/newsletter/subscribe | NewsletterApiController@subscribe |
| GET | /api/orders/track | OrderApiController@track |
| POST | /api/orders/guest | OrderApiController@storeGuest |

### Protected (auth:sanctum + throttle:60,1 + EnsurePasswordChanged)
| Method | Path | Controller | Route name |
|---|---|---|---|
| POST | /api/logout | AuthApiController@logout | api.logout |
| GET | /api/user | AuthApiController@user | — |
| PUT | /api/profile | ProfileApiController@update | — |
| POST | /api/change-password | ProfileApiController@changePassword | password.change |
| GET/POST/PATCH/DELETE | /api/cart[/{id}] | CartApiController | — |
| GET/POST | /api/orders | OrderApiController | — |
| GET | /api/orders/{id} | OrderApiController@show | — |
| PATCH | /api/orders/{id}/cancel | OrderApiController@cancel | — |
| GET/POST/DELETE | /api/wishlist[/{id}] | WishlistApiController | — |
| GET | /api/rewards | RewardsApiController@index | — |
| GET/POST | /api/returns | ReturnApiController | — |
| GET/POST | /api/support | SupportApiController | — |
| GET/PATCH/POST | /api/notifications | NotificationApiController | — |

---

## DB Schema Summary

> Full column list in migration files. Key tables only:

| Table | Purpose | Key Constraints |
|---|---|---|
| `users` | Auth accounts | `email` UNIQUE, `phone` UNIQUE, `username` UNIQUE |
| `customers` | Customer profiles (linked to users) | `email` UNIQUE, `phone` UNIQUE, `user_id` → users |
| `products` | Product catalog | `slug` UNIQUE, `sku` INDEX — **no `price` column here** |
| `product_variants` | Variant options + pricing | `sku` UNIQUE, `product_id` → products |
| `product_stocks` | Current stock level | `(product_id, product_variant_id)` UNIQUE |
| `inventories` | Stock movement log | `type` enum (in/out/adjustment/return); events auto-sync product_stocks |
| `orders` | Customer orders | `order_number` UNIQUE, `customer_id` → customers |
| `order_items` | Line items (price snapshot in meta) | `(order_id, product_id)` INDEX |
| `sales` | Admin-created sales / fulfillment records | `sale_code` UNIQUE |
| `affiliates` | Affiliate accounts | `affiliate_code` UNIQUE |
| `referrals` | Referral tracking | `order_id` UNIQUE |
| `sequences` | Auto-increment for order/sale numbers | seeded at 50000 |
| `loyalty_points` | Loyalty balance per customer | `customer_id` → customers |
| `point_transactions` | Loyalty earn/redeem log | `customer_id` INDEX |
| `wallets` | Polymorphic wallet (Customer or Affiliate) | `(walletable_id, walletable_type)` |
| `site_reviews` | One review per delivered order | `order_id` UNIQUE |
| `product_reviews` | Per-product reviews | `(product_id, status)` INDEX |
| `newsletters` | Subscriber list | `email` UNIQUE |
| `ui_settings` | Admin-editable UI config | `type` UNIQUE |

---

## Key Patterns

### Repository Layer
- All DB logic lives in `app/Http/Repositories/Admin/`
- Controllers call repo methods; no raw Eloquent in controllers
- Repositories wrap writes in `DB::transaction()`

### HasTotals Trait
- Shared by `Order` and `Sale` models
- `calculateTotals()`: `grand_total = subtotal − invoice_discount + shipping_charges + extraCharge()`
- `product_discount` is stored for display but already embedded in item subtotals — **never subtract it again**

### Named Rate Limiters
- **`throttle:10,1`** — login/register: 10 req/min
- **`throttle:api.public`** — public API: 60/min per IP, or 1000/min for `X-Build-Token` matching `BUILD_API_TOKEN`
- **`throttle:60,1`** — authenticated API: 60 req/min
- **`login:identifier|IP`** — in-controller RateLimiter: 5 attempts, 60s lockout
- **Fortify `login`** — 5/min for admin web login

### Exception Shield (`bootstrap/app.php`)
- Any unhandled `Throwable` on `api/*` or JSON-expecting requests → logs full trace, returns `{success: false, message: "Something went wrong..."}` HTTP 500
- Pass-through: ValidationException (422), AuthenticationException (401), AuthorizationException (403), ModelNotFoundException (404), HttpException
- Always safe regardless of `APP_DEBUG`

### Inventory Events
- `Inventory::created/updated/deleted` → `syncStock()` → adjusts `product_stocks.quantity`
- Low-stock threshold: 10 units → fires `LowStockAlert` event

### EnsurePasswordChanged Middleware
- Alias: `password.changed`
- Applied to all auth:sanctum routes
- Passes through `password.change` (change-password endpoint) and `api.logout` routes only

---

## Environment Variable Names

| Variable | Purpose |
|---|---|
| `APP_NAME` | Application display name |
| `APP_ENV` | Environment (production/local) |
| `APP_KEY` | Encryption key |
| `APP_DEBUG` | Debug mode (false in production) |
| `APP_URL` | Laravel backend URL |
| `FRONTEND_URL` | Next.js storefront URL (pansariinn.com) — used in emails |
| `FRONTEND_URL_2` | Vercel preview deployment URL (`https://pansarii-frontend.vercel.app`) — added to CORS `allowed_origins` alongside `FRONTEND_URL` (source: `config/cors.php`) |
| `BUILD_API_TOKEN` | Secret token for Next.js build server to bypass rate limits |
| `DB_CONNECTION` | Database driver |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Database credentials |
| `BCRYPT_ROUNDS` | bcrypt hash rounds (set to 12) |
| `MAIL_MAILER`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Email driver + sender |
| `ADMIN_EMAIL` | Admin notification email recipient |
| `SANCTUM_EXPIRATION` | API token expiry (minutes, null = forever) |
| `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER` | WebSocket credentials |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` | WhatsApp Business API |
| `MOVEX_API_TOKEN` | Movex courier integration |
| `POSTEX_API_TOKEN` | PostEx courier integration |
| `LEOPARD_API_KEY`, `LEOPARD_API_PASSWORD`, `LEOPARD_SHIPMENT_*` | Leopard courier integration |
| `QUEUE_CONNECTION` | Queue driver (sync on production) |
| `SESSION_DRIVER` | Session driver |
| `CACHE_STORE` | Cache driver |
| `LOG_CHANNEL`, `LOG_LEVEL` | Logging config |

---

## Deployment Constraints

- **Shared hosting** — no root access, no supervisor, no cron daemon control
- **`QUEUE_CONNECTION=sync`** — all queued jobs run synchronously in the request cycle
- **PHP `fileinfo` extension missing** on production → `Class "finfo" not found` on image uploads; workaround: `move_uploaded_file()` via `$file->move()` in all upload handlers (bypasses Flysystem MIME detection)
- **PHP 8.2** in Laragon CLI; project requires PHP 8.4 (`composer.json`); PHP 8.4 binary at `D:\laragon\bin\php\php-8.4\`
- **No SSH / artisan** access on production for most tasks — migrations run via cPanel / phpMyAdmin
- **Vercel** runs Next.js; needs `X-Build-Token` header to hit public API without rate-limit during `next build`

---

## Known Constraints

- `products.price` and `products.sale_price` columns exist in the model but are not the source of truth — pricing is via `product_variants.price` / `sale_price`
- `LoyaltyPointTransaction` model class does not exist (table is `point_transactions`); Customer model references it — any code calling `$customer->loyaltyTransactions` relies on a missing model class
- `customers.user_id` can be null for legacy imported customers (from old CodeIgniter site)
- Legacy customer ID map: `storage/app/legacy_customer_id_map.json`
- CORS allowed origins: `FRONTEND_URL` and `FRONTEND_URL_2` (from `config/cors.php`)
