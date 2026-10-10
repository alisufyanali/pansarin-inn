# Product Requirements — Pansari Inn (backend)

> Last verified against code: 2026-10-10.

## Purpose

Pakistani herbal / ayurvedic e-commerce store (herbs, oils, spices, Dawakhana remedies, skincare). Bilingual product names (English + Urdu).

- **pansariinn.com** — Next.js storefront (Vercel)
- **custom.pansariinn.pk** — this Laravel app: storefront API, admin panel, affiliate panel
- **pansariinn.pk** — legacy CodeIgniter site, being retired

---

## Users & Roles

| Role | Where | What |
|---|---|---|
| Guest | storefront | Browse, cart (localStorage), guest checkout (account auto-created: password = phone, must change on first login) |
| Customer (`customer` role) | storefront API (Sanctum) | Orders, cancel, returns, wishlist, rewards, reviews, profile, affiliate application |
| Affiliate (`affiliate` role, after admin approval) | `/affiliate/*` (Fortify web login) | Referral + product links, referrals, commission history, payouts |
| Staff (`super-admin`, `admin`, `manager`, any custom role) | `/admin/*` | Per-action Spatie permissions. Customer/affiliate-only users cannot enter `/admin` |

---

## Modules

### Catalog & variants — Done
Products (no price column), categories, health concerns, variants (`price`, `sale_price`, `additional`, `attributes` JSON), gallery, SEO fields, videos, stock (`product_stocks` + `inventories`).

### Pricing & checkout — Done
- Server-side pricing for every storefront order (`CheckoutPricingService`): catalogue prices, deals, coupon, shipping. Client-sent discounts/shipping/tax are ignored.
- Shipping is always the city rate (default 250) — **no free shipping** on any amount (owner, 2026-10-07).
- `POST /api/checkout/quote` gives the storefront the exact totals.
- Guest checkout auto-creates User + Customer by phone (`CustomerIdentityService`).

### Coupons — Done
Percentage/fixed, `apply_to` order/product/category, min purchase, max discount cap, `usage_limit` (counted), `per_user_limit`, valid through the whole `end_date`. Use is released when the order is cancelled.

### Product Deals — Done
Admin CRUD + toggle + duplicate. Types: percentage, fixed, flash_sale, buy_x_get_y, bundle. Shown via `/api/deals` and as `deal`/`deal_price` on product, homepage and cart APIs; applied as order line discounts with `max_uses`, `max_uses_per_user`, `stock_limit` enforced. Admin order/sale forms prefill the deal discount.

### Orders & sales — Done
- `ORDER-{seq}` from 50001; status pending → processing → shipped → delivered / cancelled / refunded.
- Stock taken at order placement, restored on cancel/delete (idempotent).
- Admin creates Sales from orders; a Sale marked delivered/cancelled/returned updates its Order (points, commission, stock follow). Once a sale exists the customer sees at least "Processing", and the order leaves the orders list (toggle to show it).
- Orders list: Status / Payment / City filters and bulk status for ticked orders. Sales list: date range (today by default) for table + stat cards.
- **Custom items**: a typed name, size, qty and price for something bought in from outside — no product, no stock movement.
- **Courier booking** (Leopards, PostEx, Movex): destination looked up by city name in the courier's list; every attempt stored in `courier_bookings`; Book / Retry from the sale page, never twice.

### Returns — Done
Customer request within 7 days of delivery (signed-in, not guest orders; eligibility sent on `GET /api/orders`); admin approve/reject/complete. Completing restocks the returned items and takes back points in proportion; an order/sale marked Returned restocks everything, takes back earned points, gives back spent points and reverses the affiliate commission (`OrderReturnService`). The money refund is still manual.

### Loyalty points — Done
Earned on delivery (`OrderObserver`, rate from settings); admin adjust/settings. Redeemed at checkout: `redeem_points` on `POST /api/orders` (logged-in only), rate `loyalty_redemption_rate` (1 = 1 point for Rs 1 since 2026-10-10; earning stays 1 point per Rs 100), whole rupees only, capped at the amount after deals + coupon; discount goes into `invoice_discount` (also stored as `orders.points_discount`); points returned when the order is cancelled (`LoyaltyRedemptionService`). `POST /api/rewards/redeem` previews how many points / rupees apply.

### Wallet — Partial
Polymorphic wallets for customers and affiliates. Affiliates use it for payouts; no customer-facing wallet spending.

### Affiliate (referral) program — Done
Apply on storefront (`/api/affiliate/apply`, `/apply-me`) → admin approves (role granted) → affiliate shares storefront links with `?ref=CODE` → referred customer (first referral wins) → fixed Rs commission per delivered order (per-affiliate override or default setting) → payout request → admin approve/reject. Products stay admin-owned; affiliates do not list products.

### Reviews — Done
Product reviews (guest or auth, verified purchase, admin reply/moderation, homepage toggle, images, helpful votes 1/IP), site reviews (per delivered order, email-verified), order reviews (admin).

### Blog, Newsletter, Contact, Support — Done
Blog with categories/tags and public count endpoints; 14 long-form SEO posts linked to products (`ProductBlogSeeder`); newsletter subscribe + admin compose; contact form; support tickets (API + admin).

### Storefront content — Done
Header marquee text (`GET /api/header`, UI Settings → Homepage); category display order and images (14 categories, empty ones hidden); "Did you mean" search suggestions; `GET /api/slugs` for storefront 404s; admin notification bell (polling, sound, WhatsApp messages).

### WhatsApp — Done
Outgoing order/sale notifications, admin chat + broadcast, incoming webhook (signed, batched, deduped, media download).

### Reports & dashboard — Done
KPIs, sales over time, top products/customers, category sales, payment breakdown, returns rate, affiliate performance, CSV export.

---

## Not done / open

| Item | Status |
|---|---|
| WhatsApp OTP for account claim / first login (default password = phone) | Open — needs decision |
| Loyalty point redemption | Done (1 point = Rs 1) |
| Points / commission reversal on returns | Done (2026-10-10); money refund still manual |
| `product_variants.price` meaning (cost vs selling) inconsistent in code | Needs owner confirmation |
| Deactivating a user revokes Sanctum tokens | Done (no admin UI toggle for `users.status` yet) |
| Manjistha duplicate product merge | Owner decision |
| VPS move (async queue) | Owner decision |

## Non-Goals

- Multi-vendor marketplace (a `vendors` table exists but is unused; affiliates are referral-only)
- Payment gateway (COD / manual transfer only)
- Multi-currency, subscriptions, native mobile app
