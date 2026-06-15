# API Test Results — Pansarin Inn

> **Tested:** 2026-06-16 00:07:30  
> **Server:** http://127.0.0.1:8000  
> **Database:** SQLite (local)  
> **Test User:** apitester1781568436@pansarin.test  
> **Test Token:** `15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d`

---

## Database State at Test Time

| Table | Count |
|-------|-------|
| categories | 5 (Herb, Oils, Supplements, Beauty Corner, Dawakhana) |
| products | 5 (Turmeric, Coconut Oil, Moringa, Multani Mitti, Rooh Afza) |
| product_variants | 28 |
| product_stocks | 2 (only variant 1 & 2 of Turmeric have stock) |
| coupons | 5 (WELCOME10, FLAT100, HERBS20, SUMMER15, FREESHIP) |
| blogs | 4 (published) |

---

## 🔐 AUTH ENDPOINTS

---

### POST /api/register

**Status:** ✅ 201 Created  
**Auth Required:** No

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"API Tester","email":"apitester1781568436@pansarin.test","password":"password123","password_confirmation":"password123","phone":"031781568436"}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "14|Pz5i2OpfoM8sqAvoiOWVpc1HyUIrZXnaft1zec2l74cb0b31",
    "user": {
      "id": 19,
      "name": "API Tester",
      "email": "apitester1781568436@pansarin.test",
      "phone": "031781568436"
    }
  }
}
```

---

### POST /api/login

**Status:** ✅ 200 OK  
**Auth Required:** No

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"apitester1781568436@pansarin.test","password":"password123"}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d",
    "user": {
      "id": 19,
      "name": "API Tester",
      "email": "apitester1781568436@pansarin.test",
      "phone": "031781568436"
    }
  }
}
```

---

### GET /api/user

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl http://127.0.0.1:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "name": "API Tester",
    "email": "apitester1781568436@pansarin.test",
    "phone": "031781568436",
    "roles": ["customer"],
    "customer": {
      "id": 20,
      "first_name": "API Tester",
      "last_name": null,
      "address": null,
      "city_id": null
    }
  }
}
```

---

### POST /api/logout

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## 🛍️ PRODUCT ENDPOINTS

---

### GET /api/categories

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** 5 categories from actual DB

**curl:**
```bash
curl http://127.0.0.1:8000/api/categories \
  -H "Accept: application/json"
```

**Actual Response:**
```json
{
  "success": true,
  "data": [
    { "id": 4, "name": "Beauty Corner", "slug": "beauty-corner", "image": null, "children": [] },
    { "id": 5, "name": "Dawakhana",     "slug": "dawakhana",     "image": null, "children": [] },
    { "id": 1, "name": "Herb",          "slug": "herb",          "image": null, "children": [] },
    { "id": 2, "name": "Oils",          "slug": "oils",          "image": null, "children": [] },
    { "id": 3, "name": "Supplements",   "slug": "supplements",   "image": null, "children": [] }
  ]
}
```

---

### GET /api/products

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** 5 products with real variants

**curl:**
```bash
curl "http://127.0.0.1:8000/api/products?per_page=5" \
  -H "Accept: application/json"
```

**Actual Response (abbreviated):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Turmeric (Haldi)",
      "slug": "turmeric-haldi",
      "sku": "HERB-001",
      "price": 0,
      "sale_price": null,
      "featured": true,
      "thumbnail": "http://127.0.0.1:8000/storage/products/turmeric.jpg",
      "category": { "id": 1, "name": "Herb", "slug": "herb" },
      "variants": [
        { "id": 1, "name": "100 gm / Powder", "sku": "HERB-001-V01", "price": 250, "stock": 3,  "is_default": true },
        { "id": 2, "name": "100 gm / Whole",  "sku": "HERB-001-V02", "price": 150, "stock": 15, "is_default": false },
        { "id": 3, "name": "250 gm / Powder", "sku": "HERB-001-V03", "price": 450, "stock": 0,  "is_default": false }
      ]
    },
    {
      "id": 2,
      "name": "Coconut Oil (Nariyal Ka Tel)",
      "slug": "coconut-oil",
      "sku": "OIL-001",
      "price": 0,
      "featured": true,
      "category": { "id": 2, "name": "Oils", "slug": "oils" },
      "variants": [
        { "id": 9,  "name": "1 L",    "sku": "OIL-001-V01", "price": 2800, "stock": 0 },
        { "id": 10, "name": "100 ml", "sku": "OIL-001-V02", "price": 350,  "stock": 0 }
      ]
    }
  ],
  "meta": { "total": 5, "per_page": 5, "current_page": 1, "last_page": 1 }
}
```

---

### GET /api/products/featured

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** 3 featured products (Turmeric, Coconut Oil, Multani Mitti)

**curl:**
```bash
curl http://127.0.0.1:8000/api/products/featured \
  -H "Accept: application/json"
```

**Actual Response (abbreviated):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Turmeric (Haldi)",              "slug": "turmeric-haldi", "featured": true },
    { "id": 2, "name": "Coconut Oil (Nariyal Ka Tel)",  "slug": "coconut-oil",    "featured": true },
    { "id": 4, "name": "Multani Mitti (Fuller's Earth)", "slug": "multani-mitti", "featured": true }
  ]
}
```

---

### GET /api/products/turmeric-haldi

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** Full product detail with 8 variants

**curl:**
```bash
curl http://127.0.0.1:8000/api/products/turmeric-haldi \
  -H "Accept: application/json"
```

**Actual Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Turmeric (Haldi)",
    "slug": "turmeric-haldi",
    "sku": "HERB-001",
    "price": 0,
    "featured": true,
    "thumbnail": "http://127.0.0.1:8000/storage/products/turmeric.jpg",
    "description": null,
    "excerpt": null,
    "gallery": [],
    "stock": 0,
    "meta_title": "Buy Premium Turmeric (Haldi) Online",
    "meta_desc": "High-quality organic turmeric available in whole and powder form",
    "category": { "id": 1, "name": "Herb", "slug": "herb" },
    "variants": [
      { "id": 1, "name": "100 gm / Powder", "sku": "HERB-001-V01", "price": 250, "stock": 3,  "is_default": true },
      { "id": 2, "name": "100 gm / Whole",  "sku": "HERB-001-V02", "price": 150, "stock": 15, "is_default": false },
      { "id": 3, "name": "250 gm / Powder", "sku": "HERB-001-V03", "price": 450, "stock": 0,  "is_default": false },
      { "id": 4, "name": "250 gm / Whole",  "sku": "HERB-001-V04", "price": 350, "stock": 0,  "is_default": false },
      { "id": 5, "name": "50 gm / Powder",  "sku": "HERB-001-V05", "price": 180, "stock": 0,  "is_default": false },
      { "id": 6, "name": "50 gm / Whole",   "sku": "HERB-001-V06", "price": 80,  "stock": 0,  "is_default": false },
      { "id": 7, "name": "500 gm / Powder", "sku": "HERB-001-V07", "price": 750, "stock": 0,  "is_default": false },
      { "id": 8, "name": "500 gm / Whole",  "sku": "HERB-001-V08", "price": 650, "stock": 0,  "is_default": false }
    ]
  }
}
```

---

## 🛒 CART ENDPOINTS

---

### POST /api/cart

**Status:** ✅ 201 Created  
**Auth Required:** Yes  
**Real Data:** Added variant_id=2 (Turmeric 100gm Whole, stock=15)

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/cart \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d" \
  -d '{"product_variant_id":2,"quantity":2}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Item added to cart.",
  "data": {
    "id": 5,
    "quantity": 2,
    "unit_price": 150,
    "subtotal": 300,
    "product": {
      "id": 1,
      "name": "Turmeric (Haldi)",
      "slug": "turmeric-haldi",
      "thumbnail": "http://127.0.0.1:8000/storage/products/turmeric.jpg"
    },
    "variant": { "id": 2, "name": "100 gm / Whole", "sku": "HERB-001-V02" }
  }
}
```

---

### GET /api/cart

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl http://127.0.0.1:8000/api/cart \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "quantity": 2,
      "unit_price": 150,
      "subtotal": 300,
      "product": { "id": 1, "name": "Turmeric (Haldi)", "slug": "turmeric-haldi", "thumbnail": "http://127.0.0.1:8000/storage/products/turmeric.jpg" },
      "variant": { "id": 2, "name": "100 gm / Whole", "sku": "HERB-001-V02" }
    }
  ]
}
```

---

### PATCH /api/cart/5

**Status:** ✅ 200 OK  
**Auth Required:** Yes  
**Real Data:** Updated cart item 5, quantity 2 → 3

**curl:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/cart/5 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d" \
  -d '{"quantity":3}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Cart updated.",
  "data": {
    "id": 5,
    "quantity": 3,
    "unit_price": 150,
    "subtotal": 450,
    "product": { "id": 1, "name": "Turmeric (Haldi)", "slug": "turmeric-haldi" },
    "variant": { "id": 2, "name": "100 gm / Whole", "sku": "HERB-001-V02" }
  }
}
```

---

### DELETE /api/cart/5

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl -X DELETE http://127.0.0.1:8000/api/cart/5 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Item removed from cart."
}
```

---

## 🏷️ COUPON ENDPOINTS

---

### POST /api/coupons/validate — WELCOME10 (percentage)

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** 10% off on Rs 1000 = Rs 100 discount

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"code":"WELCOME10","amount":1000}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully.",
  "data": {
    "code": "WELCOME10",
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_amount": 100,
    "apply_to": "order",
    "product_id": null,
    "category_id": null
  }
}
```

---

### POST /api/coupons/validate — FLAT100 (min purchase)

**Status:** ✅ 422 Unprocessable (Expected)  
**Note:** FLAT100 requires min purchase Rs 1000, tested with Rs 500

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"code":"FLAT100","amount":500}'
```

**Actual Response:**
```json
{
  "success": false,
  "message": "Minimum purchase of 1000.00 required."
}
```

---

## 📦 ORDER ENDPOINTS

---

### POST /api/orders

**Status:** ✅ 201 Created  
**Auth Required:** Yes  
**Real Data:** Order ORD-20260615-BA25 created with Turmeric (100gm Whole × 2)

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d" \
  -d '{
    "shipping_address": "House 5 Block A Lahore",
    "payment_method": "Cash on Delivery",
    "order_note": "API test",
    "shipping_charges": 100,
    "items": [{"product_id":1,"product_variant_id":2,"quantity":2,"price":150,"discount":0}]
  }'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": 21,
    "order_number": "ORD-20260615-BA25",
    "status": "pending",
    "payment_status": "unpaid",
    "payment_method": "Cash on Delivery",
    "grand_total": 400,
    "subtotal": 300,
    "shipping": 100,
    "discount": 0,
    "tax": 0,
    "city": null,
    "created_at": "2026-06-15T19:07:24.000000Z"
  }
}
```

---

### GET /api/orders

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl http://127.0.0.1:8000/api/orders \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 21,
      "order_number": "ORD-20260615-BA25",
      "status": "pending",
      "payment_status": "unpaid",
      "payment_method": "Cash on Delivery",
      "grand_total": 400,
      "subtotal": 300,
      "shipping": 100,
      "discount": 0,
      "tax": 0,
      "city": null,
      "created_at": "2026-06-15T19:07:24.000000Z"
    }
  ],
  "meta": { "total": 1, "per_page": 10, "current_page": 1, "last_page": 1 }
}
```

---

### GET /api/orders/21

**Status:** ✅ 200 OK  
**Auth Required:** Yes  
**Real Data:** Full order detail with actual items

**curl:**
```bash
curl http://127.0.0.1:8000/api/orders/21 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "data": {
    "id": 21,
    "order_number": "ORD-20260615-BA25",
    "status": "pending",
    "payment_status": "unpaid",
    "payment_method": "Cash on Delivery",
    "grand_total": 400,
    "subtotal": 300,
    "shipping": 100,
    "discount": 0,
    "tax": 0,
    "city": null,
    "shipping_address": "House 5 Block A Lahore",
    "billing_address": null,
    "order_note": "API test",
    "tracking": null,
    "created_at": "2026-06-15T19:07:24.000000Z",
    "items": [
      {
        "id": 57,
        "product_name": "Turmeric (Haldi)",
        "variant": "100 gm / Whole",
        "quantity": 2,
        "price": 150,
        "discount": 0,
        "subtotal": 300
      }
    ]
  }
}
```

---

## ❤️ WISHLIST ENDPOINTS

---

### POST /api/wishlist

**Status:** ✅ 201 Created  
**Auth Required:** Yes

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/wishlist \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d" \
  -d '{"product_id":1,"product_variant_id":1}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Added to wishlist.",
  "data": { "id": 5 }
}
```

---

### GET /api/wishlist

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl http://127.0.0.1:8000/api/wishlist \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "product": {
        "id": 1,
        "name": "Turmeric (Haldi)",
        "slug": "turmeric-haldi",
        "price": 0,
        "sale_price": null,
        "thumbnail": "http://127.0.0.1:8000/storage/products/turmeric.jpg"
      },
      "variant": { "id": 1, "name": "100 gm / Powder", "sku": "HERB-001-V01" },
      "created_at": "2026-06-15T19:07:26.000000Z"
    }
  ]
}
```

---

### DELETE /api/wishlist/5

**Status:** ✅ 200 OK  
**Auth Required:** Yes

**curl:**
```bash
curl -X DELETE http://127.0.0.1:8000/api/wishlist/5 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 15|0K0kqECntq6f2GlxvGeSDs8A0dOSvJMSAikRFSeVcedb925d"
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Removed from wishlist."
}
```

---

## 📝 BLOG ENDPOINTS

---

### GET /api/blogs

**Status:** ✅ 200 OK  
**Auth Required:** No  
**Real Data:** 4 published blogs from real DB

**curl:**
```bash
curl http://127.0.0.1:8000/api/blogs \
  -H "Accept: application/json"
```

**Actual Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Top 10 Herbal Remedies for Common Cold",       "slug": "top-10-herbal-remedies-for-common-cold",         "excerpt": "Discover natural herbs that can help you fight the common cold effectively.", "category": { "id": 1, "name": "Herbal Remedies", "slug": "herbal-remedies" } },
    { "id": 2, "title": "Benefits of Ajwain (Carom Seeds) for Digestion","slug": "benefits-of-ajwain-carom-seeds-for-digestion",      "excerpt": "Ajwain is a powerful herb known for its digestive properties." },
    { "id": 3, "title": "Kalonji (Black Seed) — The Miracle Herb",       "slug": "kalonji-black-seed-the-miracle-herb",            "excerpt": "Black seed has been called a cure for everything except death." },
    { "id": 4, "title": "How to Use Turmeric for Inflammation",           "slug": "how-to-use-turmeric-for-inflammation",           "excerpt": "Turmeric contains curcumin, a natural anti-inflammatory compound." }
  ],
  "meta": { "total": 4, "per_page": 10, "current_page": 1, "last_page": 1 }
}
```

---

## 📬 CONTACT ENDPOINT

---

### POST /api/contact

**Status:** ✅ 201 Created  
**Auth Required:** No

**curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/contact \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"API Tester","email":"tester@pansarin.test","phone":"03009876543","subject":"API Test","message":"Real test message via API."}'
```

**Actual Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully.",
  "data": { "id": 29 }
}
```

---

## 📋 Final Summary Table

| Endpoint | Method | Auth | HTTP | Status | Real Data Used |
|----------|--------|------|------|--------|----------------|
| `/api/register` | POST | No | 201 | ✅ | User ID 19, real email |
| `/api/login` | POST | No | 200 | ✅ | Same user, real token |
| `/api/user` | GET | Yes | 200 | ✅ | User 19 with customer profile |
| `/api/logout` | POST | Yes | 200 | ✅ | Token revoked |
| `/api/categories` | GET | No | 200 | ✅ | 5 real categories |
| `/api/products` | GET | No | 200 | ✅ | 5 real products, 28 variants |
| `/api/products/featured` | GET | No | 200 | ✅ | 3 featured products |
| `/api/products/turmeric-haldi` | GET | No | 200 | ✅ | Real product, 8 variants |
| `/api/cart` (POST) | POST | Yes | 201 | ✅ | variant_id=2, stock=15 |
| `/api/cart` (GET) | GET | Yes | 200 | ✅ | Cart item 5 |
| `/api/cart/{id}` (PATCH) | PATCH | Yes | 200 | ✅ | qty 2→3, subtotal 300→450 |
| `/api/cart/{id}` (DELETE) | DELETE | Yes | 200 | ✅ | Cart item 5 removed |
| `/api/coupons/validate` (WELCOME10) | POST | No | 200 | ✅ | 10% off = Rs 100 |
| `/api/coupons/validate` (FLAT100) | POST | No | 422 | ✅ | Min purchase check works |
| `/api/orders` (POST) | POST | Yes | 201 | ✅ | ORD-20260615-BA25 |
| `/api/orders` (GET) | GET | Yes | 200 | ✅ | 1 order listed |
| `/api/orders/{id}` | GET | Yes | 200 | ✅ | Order 21 with items |
| `/api/wishlist` (POST) | POST | Yes | 201 | ✅ | wishlist_id=5 |
| `/api/wishlist` (GET) | GET | Yes | 200 | ✅ | 1 item listed |
| `/api/wishlist/{id}` (DELETE) | DELETE | Yes | 200 | ✅ | Item 5 removed |
| `/api/blogs` | GET | No | 200 | ✅ | 4 real blogs |
| `/api/contact` | POST | No | 201 | ✅ | contact_id=29 |

**Total: 22 endpoints tested | ✅ 21 Passed | ℹ️ 1 Expected Error (FLAT100 min purchase)**

---

## Bugs Fixed During Testing

| Bug | Fix Applied |
|-----|-------------|
| `CouponApiController::validate()` conflicts with parent | Renamed to `check()` |
| Namespace `Api` vs folder `API` | Updated all namespaces to `App\Http\Controllers\API` |
| `Customer::$fillable` missing `user_id`, `status` | Added to `$fillable` |
| Customer profile `user_id` = NULL on register | Fixed field mass assignment issue |

---

*Tests run on: 2026-06-16 | Server: Laravel 12 + PHP 8.4 | DB: SQLite*
