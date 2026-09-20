# Product Requirements — Pansari Inn

## Purpose

Pakistani herbal/ayurvedic e-commerce store. Sells wholesale and retail herbal products, spices, Dawakhana remedies, and natural wellness items. Bilingual product names (English + Urdu). Two active domains:

- **pansariinn.com** — New Next.js storefront (active, on Vercel)
- **pansariinn.pk** — Legacy CodeIgniter site (being retired; 308 redirects to new site)

Backend: Laravel 12 API + Inertia/React admin panel, hosted on shared Hostinger hosting.

---

## Target Users

| Role | Description |
|---|---|
| **Customer** | Registered account; can order, track, return, leave reviews, earn loyalty points, use wishlist |
| **Guest** | Checkout without registering; account auto-created silently; email + phone stored |
| **Affiliate** | Earns commission on referred orders; has affiliate code, payout requests, wallet |
| **Admin** | Full CRUD on all modules via admin panel at `/admin/*`; multiple sub-roles via Spatie permissions |

---

## Feature List by Module

### Catalog
- Products with name, Urdu name, scientific name, SKU, slug (unique), unit, thumbnail, gallery
- Categories (hierarchical, parent_id self-referential)
- Product variants: Weight, Size, Form attributes — `price` and `sale_price` live on variants only
- Health Concerns pivot (many-to-many) for filtering
- Rich product detail: ingredients, how_to_use, benefits, key_features (all JSON arrays)
- SEO fields: meta_title, meta_description, meta_keywords, schema_markup, social_image
- Featured products, deals/offers (percentage or fixed discount, date-bounded)
- Product videos (video URL field)
- **Status: DONE** — fully seeded, API served at `/api/products`

### Variants
- `product_variants`: SKU, value string, attributes JSON (`{"Weight": "100 gm"}` etc.), price, sale_price, is_default, stock_alert
- Stock tracked in `product_stocks` and `inventories` (event-driven sync)
- Variant label built by `collect(attributes)->values()->join(' / ')` — no hardcoded key names
- Backfill command exists for flat-import variants missing attributes JSON
- **Status: DONE** — variant display fix applied

### Cart / Checkout
- Authenticated cart (`carts` table, per user+variant)
- Guest checkout: `POST /api/orders/guest` — auto-creates User + Customer; phone normalized to `03XXXXXXXXX`; password = normalized phone; `must_change_password = true`
- Coupon validation before order creation
- City-based shipping charges
- **Status: DONE** (guest checkout crash fix applied)

### Orders
- Created by authenticated users (`POST /api/orders`) or guests (`POST /api/orders/guest`)
- `order_number` auto-generated: `ORDER-{seq}` starting at 50001
- `grand_total = subtotal − invoice_discount + shipping_charges + tax` (product_discount is display-only, already in item subtotals)
- Items carry `meta` JSON snapshot (product_name, sku, variant_name, cost_price)
- Stock deducted at order creation via Inventory events → ProductStock
- Status flow: `pending → processing → shipped → delivered → cancelled/refunded`
- On `delivered`: AffiliateService triggered for commission
- Admin can create orders directly (admin panel)
- **Status: DONE**

### Returns
- Customer submits return request with reason_category + comment
- Admin reviews and updates status
- `return_requests` + `return_request_items` tables
- **Status: DONE** (admin module built)

### Loyalty Points
- `loyalty_points` (balance per customer) + `point_transactions` (earn/redeem/admin_adjustment)
- Admin can adjust balance manually
- Frontend rewards page: **PARTIAL** (backend done, frontend sections incomplete)

### Wallet
- Polymorphic (`walletable`) — used by both Customer and Affiliate
- `wallet_transactions`: credit/debit with reference morphs
- **Status: PARTIAL** — model and DB done; frontend integration TODO: confirm

### Affiliates / Referrals
- Affiliate code, commission rate, multi-level (`parent_id` on affiliates)
- `referrals` table tracks referred customers + orders
- `affiliate_commissions` table per order
- Payout requests with admin approval
- **Status: PARTIAL** — backend done; affiliate-facing frontend TODO: confirm

### Reviews
- **Product reviews**: guest or authenticated; verified-purchase detection; admin reply; show_on_homepage toggle; multi-image upload; helpful_count
- **Site reviews**: one per delivered order (verified by email match); admin approval flow; image upload
- **Order reviews**: post-order admin review (separate from product reviews)
- Admin: approve/reject, bulk actions, reply
- **Status: DONE** (dummy seeder done; display fixes done)

### Blog
- `blogs` + `blog_categories` (hierarchical) + `blog_tags` (many-to-many)
- `blog_comments` with moderation
- API: `GET /api/blogs`, `GET /api/blogs/{slug}`
- **Status: PARTIAL** — category/tag article count shows 0 on frontend (known bug)

### Newsletter
- Subscribe via `POST /api/newsletter/subscribe`
- Verification token + verified_at flow
- Admin compose + send to subscriber list
- **Status: DONE**

### Health Concerns
- `health_concerns` table with icon, status, sort_order
- Many-to-many with products via `product_health_concern`
- API: `GET /api/health-concerns`
- **Status: DONE** (seeded)

### Reports
- Admin reports: summary KPIs, sales-over-time, top products, top customers, category sales, payment breakdown, returns rate, affiliate performance
- CSV export
- **Status: DONE** (admin module built)

### Contacts / Support
- Public `POST /api/contact` — stores in `contacts`
- Ticket system (`tickets` + `ticket_replies`) — API endpoints exist
- Admin: view, reply, status update, bulk actions
- **Status: DONE** (admin done; ticket API partial)

### WhatsApp
- Incoming message log + admin chat interface
- Broadcast to bulk customers
- Order/sale confirmation via WhatsApp notification jobs
- **Status: DONE** (admin panel done)

---

## Done / Partial / Missing

| Module | Status |
|---|---|
| Catalog + variants API | ✅ Done |
| Admin CRUD (products, categories, etc.) | ✅ Done |
| Cart + authenticated orders | ✅ Done |
| Guest checkout + auto-account | ✅ Done |
| Order emails + WhatsApp | ✅ Done |
| Returns admin | ✅ Done |
| Loyalty admin | ✅ Done |
| Reports | ✅ Done |
| Product reviews (public + admin) | ✅ Done |
| Site reviews | ✅ Done |
| Blog (admin + API) | ✅ Done |
| Newsletter | ✅ Done |
| Health Concerns | ✅ Done |
| WhatsApp chat + broadcast | ✅ Done |
| must_change_password flow | ✅ Done |
| Wallet (DB + model) | 🔶 Partial — frontend TODO: confirm |
| Loyalty frontend (rewards page) | 🔶 Partial — some sections missing |
| Affiliate frontend dashboard | 🔶 Partial — TODO: confirm |
| Blog category/tag article count | ❌ Bug (shows 0) |
| Guest checkout validation error display | ❌ Missing on frontend |
| Pakistan-only phone validation on frontend | ❌ Missing |
| Add-to-cart toast in quick view | ❌ Missing |
| Review count on product card | ❌ Missing |
| Footer category links | ❌ Missing |
| Banner sizing (812×317) | ❌ Missing |
| fileinfo fallback for uploads on production | ❌ Pending |
| Manjistha product merge decision | ❌ Pending owner decision |
| AdminSeeder production guard | ❌ Missing |

---

## Non-Goals

- No multi-vendor storefront (vendor table exists but not surfaced)
- No payment gateway integration yet (COD only; Stripe/PayPal fields exist but unused)
- No PWA / mobile app
- No multi-currency
- No subscription / recurring orders
